import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { check } from 'meteor/check'
import bugzillaApi from '../util/bugzilla-api'
import _ from 'lodash'
import publicationFactory from './base/rest-resource-factory'
import { makeAssociationFactory, withUsers, withDocs } from './base/associations-helper'
import { serverHelpers } from './units'
import UnitMetaData, { collectionName as unitMetaCollName } from './unit-meta-data'
import { emailValidator } from '../util/validators'
import
PendingInvitations,
{
  unassignPending,
  createPendingInvitation,
  findUnitRoleConflictErrors,
  TYPE_ASSIGNED
} from './pending-invitations'

export const collectionName = 'cases'
export const caseServerFieldMapping = {
  category: 'rep_platform',
  subCategory: 'cf_ipi_clust_6_claim_type',
  priority: 'priority',
  severity: 'bug_severity',
  selectedUnit: 'product',
  assignedUnitRole: 'component',
  title: 'summary',
  details: 'description',
  nextSteps: 'cf_ipi_clust_1_next_step',
  nextStepsBy: 'cf_ipi_clust_1_next_step_by',
  solution: 'cf_ipi_clust_1_solution',
  solutionDeadline: 'deadline',
  involvedList: 'cc',
  involvedListDetail: 'cc_detail',
  assignee: 'assigned_to',
  assigneeDetail: 'assigned_to_detail',
  creator: 'creator',
  creatorDetail: 'creator_detail',
  status: 'status',
  resolution: 'resolution',
  additionalComments: 'whiteboard'
}

export const REPORT_KEYWORD = 'inspection_report'

export const isClosed = caseItem => ['RESOLVED', 'VERIFIED', 'CLOSED'].includes(caseItem.status)

export const caseClientFieldMapping = Object.assign(
  Object.keys(caseServerFieldMapping).reduce((all, key) => ({
    ...all,
    [caseServerFieldMapping[key]]: key
  }), {}),
  {
    platform: 'category'
  }
)

export const getCaseUsers = (() => {
  const normalizeUser = ({real_name: realName, email, name}) => ({
    login: name,
    name: realName,
    email
  })
  return caseItem => ({
    creator: normalizeUser(caseItem.creatorDetail),
    assignee: normalizeUser(caseItem.assigneeDetail),
    subscribed: caseItem.involvedListDetail.map(normalizeUser)
  })
})()

export const caseQueryBuilder = (expressions, fields) => {
  let currOp = 0
  const expObject = (function translate (expArr) {
    return expArr.reduce((all, { field, operator, value }) => {
      currOp++
      if (['OR', 'AND'].includes(operator)) {
        all['f' + currOp] = 'OP'
        if (operator === 'OR') {
          all['j' + currOp] = operator
        }
        Object.assign(all, translate(value))
        currOp++
        all['f' + currOp] = 'CP'
      } else {
        all['f' + currOp] = field
        all['o' + currOp] = operator
        all['v' + currOp] = value
      }
      return all
    }, {})
  })(expressions)
  return {
    list_id: '78',
    query_format: 'advanced',
    include_fields: fields.join(','),
    ...expObject
  }
}

export const associatedCasesQueryExps = userIdentifier => [
  {
    operator: 'OR',
    value: [
      {
        field: 'assigned_to',
        operator: 'equals',
        value: userIdentifier
      },
      {
        field: 'cc',
        operator: 'substring',
        value: userIdentifier
      },
      {
        field: 'reporter',
        operator: 'equals',
        value: userIdentifier
      }
    ]
  }
]

const denormalizeUser = ({login, name, email}) => ({
  name: login,
  real_name: name,
  email
})

const transformCaseForClient = bug => Object.keys(bug).reduce((all, key) => ({
  ...all,
  [caseClientFieldMapping[key] || key]: bug[key]
}), {})

// Exported for testing purposes
export const factoryOptions = {
  collectionName,
  dataResolver: data => data.bugs.map(transformCaseForClient)
}
export const idUrlTemplate = caseId => `/rest/bug/${caseId}`

export let reloadCaseFields
let publicationObj
if (Meteor.isServer) {
  publicationObj = publicationFactory(factoryOptions)
  reloadCaseFields = (caseId, fieldNames) => {
    const caseData = bugzillaApi.callAPI('get', idUrlTemplate(caseId), {}, true, true)
    const caseItem = transformCaseForClient(caseData.data.bugs[0])
    const fields = Object.keys(caseItem).reduce((all, key) => {
      if (fieldNames.includes(key)) {
        all[key] = caseItem[key]
      }
      return all
    }, {})
    publicationObj.handleChanged(caseId, fields)
  }
  const associationFactory = makeAssociationFactory(collectionName)

  Meteor.publish(`${collectionName}.byId`, associationFactory(
    publicationObj.publishById({
      uriTemplate: idUrlTemplate
    }),
    withUsers(caseItem => _.flatten(Object.values(getCaseUsers(caseItem))).map(u => u.login))
  ))

  const noReportsExp = {
    field: 'keywords',
    operator: 'nowords',
    value: REPORT_KEYWORD
  }

  // TODO: Add tests for this
  Meteor.publish(`${collectionName}.associatedWithMe`, associationFactory(
    publicationObj.publishByCustomQuery({
      uriTemplate: () => '/rest/bug',
      queryBuilder: subHandle => {
        if (!subHandle.userId) {
          return {}
        }
        const currUser = Meteor.users.findOne(subHandle.userId)
        const { login: userIdentifier } = currUser.bugzillaCreds
        return caseQueryBuilder(
          [
            noReportsExp,
            ...associatedCasesQueryExps(userIdentifier)
          ],
          [
            'product',
            'summary',
            'id',
            'status',
            'assigned_to',
            'creation_time'
          ]
        )
      },
      addedMatcherFactory: strQuery => {
        const { v1: userIdentifier } = JSON.parse(strQuery)
        return caseItem => {
          const { assignee, creator, involvedList, keywords } = transformCaseForClient(caseItem)
          return (
            !(keywords && keywords.includes(REPORT_KEYWORD)) && (
              userIdentifier === assignee ||
              userIdentifier === creator ||
              involvedList.includes(userIdentifier)
            )
          )
        }
      }
    }),
    withDocs({
      cursorMaker: publishedItem => {
        return UnitMetaData.find({
          bzName: publishedItem.selectedUnit
        }, {
          bzId: 1,
          bzName: 1,
          unitType: 1
        })
      },
      collectionName: unitMetaCollName
    })
  ))
  Meteor.publish(`${collectionName}.byUnitName`, publicationObj.publishByCustomQuery({
    uriTemplate: () => '/rest/bug',
    queryBuilder: (subHandle, unitName) => {
      if (!subHandle.userId) {
        return {}
      }
      const currUser = Meteor.users.findOne(subHandle.userId)
      const { login: userIdentifier } = currUser.bugzillaCreds
      return caseQueryBuilder(
        [
          {
            field: 'product',
            operator: 'equals',
            value: unitName
          },
          noReportsExp,
          ...associatedCasesQueryExps(userIdentifier)
        ],
        [
          'product',
          'summary',
          'id',
          'status',
          'severity',
          'assigned_to'
        ]
      )
    },
    addedMatcherFactory: strQuery => {
      const { v1: unitName, v3: userIdentifier } = JSON.parse(strQuery)
      return caseItem => {
        const { selectedUnit, assignee, creator, involvedList, keywords } = transformCaseForClient(caseItem)
        return (
          selectedUnit === unitName && !(keywords && keywords.includes(REPORT_KEYWORD)) && (
            userIdentifier === assignee ||
            userIdentifier === creator ||
            involvedList.includes(userIdentifier)
          )
        )
      }
    }
  }))
}

export const fieldEditMethodMaker = ({ editableFields, methodName, publicationObj, clientCollection }) =>
  (caseId, changeSet) => {
    check(caseId, Number)
    Object.keys(changeSet).forEach(fieldName => {
      if (!editableFields.includes(fieldName)) {
        throw new Meteor.Error(`illegal field name ${fieldName}`)
      }
      const valType = typeof changeSet[fieldName]
      if (!['number', 'string', 'boolean'].includes(valType)) {
        throw new Meteor.Error(`illegal value type of ${valType} set to field ${fieldName}`)
      }
    })
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized')
    }

    if (Meteor.isClient) {
      Cases.update({id: caseId}, {
        $set: changeSet
      })
    } else { // is server
      const { callAPI } = bugzillaApi
      const { bugzillaCreds: { apiKey } } = Meteor.users.findOne({_id: Meteor.userId()})
      try {
        const normalizedSet = Object.keys(changeSet).reduce((all, key) => {
          all[caseServerFieldMapping[key]] = changeSet[key]
          return all
        }, {})
        callAPI('put', `/rest/bug/${caseId}`, Object.assign({api_key: apiKey}, normalizedSet), false, true)
        const { data: { bugs: [caseItem] } } = callAPI(
          'get', `/rest/bug/${caseId}`, {api_key: apiKey}, false, true
        )
        const updatedSet = Object.keys(changeSet).reduce((all, key) => {
          all[key] = caseItem[caseServerFieldMapping[key]]
          return all
        }, {})
        publicationObj.handleChanged(caseId, updatedSet)
      } catch (e) {
        console.error({
          user: Meteor.userId(),
          method: methodName,
          args: [caseId, changeSet],
          error: e
        })
        throw new Meteor.Error('API error')
      }
    }
  }

let Cases
if (Meteor.isClient) {
  Cases = new Mongo.Collection(collectionName)
}

Meteor.methods({
  [`${collectionName}.toggleParticipants`] (loginNames, caseId, isAdd = true) {
    check(loginNames, Array)
    check(caseId, Number)

    loginNames.forEach(email => {
      if (!emailValidator(email)) {
        throw new Meteor.Error(`"${email}" is not valid as an email address`)
      }
    })

    // Making sure the user is logged in before inserting a comment
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized')
    }

    const { callAPI } = bugzillaApi
    const currUser = Meteor.users.findOne({_id: Meteor.userId()})

    if (Meteor.isClient) {
      const opType = isAdd ? '$push' : '$pull'
      loginNames.forEach(email => {
        Cases.update({id: caseId}, {
          [opType]: {
            involvedList: email
          },
          [opType]: {
            involvedListDetail: {name: email}
          }
        })
      })
    } else {
      const { apiKey } = currUser.bugzillaCreds
      const opType = isAdd ? 'add' : 'remove'
      const payload = {
        api_key: apiKey,
        cc: {
          [opType]: loginNames
        }
      }
      try {
        callAPI('put', `/rest/bug/${caseId}`, payload, false, true)

        reloadCaseFields(caseId, ['involvedList', 'involvedListDetail'])
        loginNames.forEach(email => console.log(`${email} was ${isAdd ? '' : 'un'}subscribed to case ${caseId}`))
      } catch (e) {
        console.error({
          user: Meteor.userId(),
          method: `${collectionName}.toggleParticipant`,
          args: [loginNames, caseId, isAdd],
          error: e
        })
        throw new Meteor.Error(`API Error: ${e.response.data.message}`)
      }
    }
  },
  [`${collectionName}.insert`] (params, { newUserEmail, newUserIsOccupant, parentReportId }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized')
    }
    if (Meteor.isServer) {
      const { bugzillaCreds: { apiKey } } = Meteor.users.findOne(Meteor.userId())
      const { callAPI } = bugzillaApi

      let unitItem
      try {
        unitItem = serverHelpers.getAPIUnitByName(params.selectedUnit, apiKey)
      } catch (e) {
        console.error(e)
        throw new Meteor.Error('API error')
      }

      // Checking the role is valid
      const relevantRole = unitItem.components.find(({ name }) => name === params.assignedUnitRole)
      if (!relevantRole) {
        throw new Meteor.Error(
          `The designated role "${params.assignedUnitRole}" does not exist on the unit "${params.selectedUnit}"`
        )
      }
      if (newUserEmail) {
        const conflictError = findUnitRoleConflictErrors(
          unitItem.id,
          newUserEmail,
          params.assignedUnitRole,
          newUserIsOccupant
        )
        if (conflictError) throw new Meteor.Error('Could not create case for new assignee: ' + conflictError)
      }

      console.log('Creating case', params)
      const normalizedParams = Object.keys(params).reduce((all, paramName) => {
        all[caseServerFieldMapping[paramName] || paramName] = params[paramName]
        return all
      }, {})

      // Hardcoded values to avoid issues with BZ API "required" checks
      normalizedParams.version = '---'
      normalizedParams.op_sys = 'Unspecified' // NOTE: This might an actual value at a later evolution step of the app
      normalizedParams[caseServerFieldMapping.category] = normalizedParams[caseServerFieldMapping.category] || '---'
      normalizedParams[caseServerFieldMapping.subCategory] = normalizedParams[caseServerFieldMapping.subCategory] || '---'

      normalizedParams.api_key = apiKey
      let newCaseId
      try {
        const { data } = callAPI('post', '/rest/bug', normalizedParams, false, true)
        newCaseId = data.id
        console.log(`a new case has been created by user ${Meteor.userId()}, case id: ${newCaseId}`)
        // TODO: Add real time update handler usage
      } catch (e) {
        console.error({
          user: Meteor.userId(),
          method: `${collectionName}.insert`,
          args: [params],
          step: 'post /rest/bug bugzilla API',
          error: e
        })
        throw new Meteor.Error(`API Error: ${e.response.data.message}`)
      }

      // Creating report's dependency on this case
      if (parentReportId) {
        const payload = {
          api_key: apiKey,
          blocks: {
            set: [parentReportId]
          }
        }
        try {
          callAPI('put', `/rest/bug/${newCaseId}`, payload, false, true)
        } catch (e) {
          console.error({
            user: Meteor.userId(),
            method: `${collectionName}.insert`,
            args: [params],
            step: 'put /rest/bug bugzilla API (creating report dependency)',
            error: e
          })
          throw new Meteor.Error(`API Error: ${e.response.data.message}`)
        }
      }

      if (newUserEmail) {
        createPendingInvitation(
          newUserEmail, params.assignedUnitRole, newUserIsOccupant, newCaseId, unitItem.id, TYPE_ASSIGNED
        )
      }
      return {newCaseId}
    }
  },
  [`${collectionName}.changeAssignee`] (user, caseId) {
    check(user, Object)
    check(user.login, String)
    check(caseId, Number)

    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized')
    }

    const assigneeUser = Meteor.users.findOne({'bugzillaCreds.login': user.login})

    unassignPending(caseId)

    let isPending, invitationMatcher
    if (assigneeUser) {
      invitationMatcher = {
        caseId,
        invitee: assigneeUser.bugzillaCreds.id,
        done: { $ne: true }
      }
      isPending = !!PendingInvitations.findOne(invitationMatcher)
    }

    if (isPending) {
      Meteor.users.update({
        'bugzillaCreds.login': user.login,
        'receivedInvites.caseId': caseId
      }, {
        $set: {
          'receivedInvites.$.type': TYPE_ASSIGNED
        }
      })
      PendingInvitations.update(invitationMatcher, {
        $set: {
          type: TYPE_ASSIGNED
        }
      })
    } else {
      if (Meteor.isClient) {
        Cases.update({id: caseId}, {
          $set: {
            assigneeDetail: denormalizeUser(user),
            assignee: user.login
          }
        })
      } else { // is server
        const { callAPI } = bugzillaApi
        const { bugzillaCreds: { apiKey } } = Meteor.users.findOne({_id: Meteor.userId()})
        try {
          callAPI('put', `/rest/bug/${caseId}`, {
            [caseServerFieldMapping.assignee]: user.login,
            api_key: apiKey
          }, false, true)
          reloadCaseFields(caseId, ['assignee', 'assigneeDetail'])
          console.log(`${user.login} was assigned to case ${caseId}`)
        } catch (e) {
          console.error({
            user: Meteor.userId(),
            method: `${collectionName}.changeAssignee`,
            args: [user, caseId],
            error: e
          })
          throw new Meteor.Error('API error')
        }
      }
    }
  },
  [`${collectionName}.editCaseField`]: fieldEditMethodMaker({
    methodName: `${collectionName}.editCaseField`,
    editableFields: [
      'title',
      'solution',
      'nextSteps',
      'status',
      'resolution'
    ],
    clientCollection: Cases,
    publicationObj
  })
})

export default Cases
