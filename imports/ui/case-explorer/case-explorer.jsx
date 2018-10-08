import React, { Component } from 'react'
import { Meteor } from 'meteor/meteor'
import { connect } from 'react-redux'
import { createContainer } from 'meteor/react-meteor-data'
import PropTypes from 'prop-types'
import UnverifiedWarning from '../components/unverified-warning'
import { withRouter } from 'react-router-dom'
import FontIcon from 'material-ui/FontIcon'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import memoizeOne from 'memoize-one'
import Cases, { collectionName, isClosed } from '../../api/cases'
import CaseNotifications, { collectionName as notifCollName } from '../../api/case-notifications'
import UnitMetaData from '../../api/unit-meta-data'
import RootAppBar from '../components/root-app-bar'
import Preloader from '../preloader/preloader'
import { NoItemMsg } from '../explorer-components/no-item-msg'
import { UnitGroupList } from '../explorer-components/unit-group-list'
import { storeBreadcrumb } from '../general-actions'
import { CaseList } from '../case-explorer/case-list'
import UnitSelectDialog from '../dialogs/unit-select-dialog'
import { push } from 'react-router-redux'
import { SORT_BY, sorters } from '../explorer-components/sort-items'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'
import {
  selectInputIconStyle,
  noUnderline,
  sortBoxInputStyle,
  selectedItemStyle
} from '../components/form-controls.mui-styles'

class CaseExplorer extends Component {
  constructor () {
    super(...arguments)
    this.state = {
      caseId: '',
      open: false,
      statusFilterValues: [],
      sortBy: null
    }
  }
  handleFilterClicked = (event, index, statusFilterValues) => {
    this.setState({
      statusFilterValues: statusFilterValues
    })
  }

  handleSortClicked = (event, index, value) => {
    this.setState({
      sortBy: value
    })
  }

  filterMenu (statusFilterValues) {
    const status = ['Open', 'Closed', 'Assigned To Me']
    return status.map((name) => (
      <MenuItem
        key={name}
        insetChildren
        checked={statusFilterValues && statusFilterValues.indexOf(name) > -1}
        value={name}
        primaryText={name}
      />
    ))
  }

  sortMenu (sortBy) {
    const labels = [
      [SORT_BY.DATE_ASCENDING, 'Newest'],
      [SORT_BY.DATE_DESCENDING, 'Oldest'],
      [SORT_BY.NAME_ASCENDING, 'Name (A to Z)'],
      [SORT_BY.NAME_DESCENDING, 'Name (Z to A)']
    ]
    return labels.map(([sortBy, label], index) => (
      <MenuItem
        key={sortBy}
        value={sortBy}
        primaryText={label}
      />
    ))
  }

  handleOnItemClicked = () => {
    const { dispatch, match } = this.props
    dispatch(storeBreadcrumb(match.url))
  }

  handleOnUnitClicked = (unitId) => {
    const { dispatch } = this.props
    dispatch(push(`/case/new?unit=${unitId}`))
  }

  componentWillReceiveProps ({isLoading, casesError, caseList}) {
    if (!isLoading && !casesError && isLoading !== this.props.isLoading) {
      this.props.dispatchLoadingResult({caseList})
    }
  }
  makeCaseUpdateTimeDict = memoizeOne(
    allNotifications => allNotifications.reduce((dict, curr) => {
      const caseIdStr = curr.caseId.toString()
      const prevTime = dict[caseIdStr] ? dict[caseIdStr] : 0 // if dict[curr.caseId] === 0 it'll be set to 0, so no harm
      const currTime = curr.createdAt.getTime()
      dict[caseIdStr] = prevTime < currTime ? currTime : prevTime
      return dict
    }, {}),
    (a, b) => a.length === b.length
  )
  makeCaseUnreadDict = memoizeOne(
    unreadNotifs => unreadNotifs.reduce((dict, curr) => {
      const caseIdStr = curr.caseId.toString()
      const unreadItem = dict[caseIdStr] = dict[caseIdStr] || {messages: 0, updates: 0}
      switch (curr.type) {
        case 'message':
          unreadItem.messages++
          break
        case 'update':
          unreadItem.updates++
      }
      return dict
    }, {}),
    (a, b) => a.length === b.length
  )
  makeCaseGrouping = memoizeOne(
    (caseList, statusFilterValues, sortBy, allNotifs, unreadNotifs) => {
      const openFilter = statusFilterValues.length === 3 || (statusFilterValues.includes('Open') && statusFilterValues.includes('Closed')) ? x => true
        : statusFilterValues.includes('Open') ? x => !isClosed(x)
          : statusFilterValues.includes('Closed') ? x => isClosed(x) : x => true
      const assignedFilter = statusFilterValues.includes('Assigned To Me') ? x => x.assignee === this.props.currentUser.bugzillaCreds.login : x => true
      const caseUpdateTimeDict = this.makeCaseUpdateTimeDict(allNotifs)
      const caseUnreadDict = this.makeCaseUnreadDict(unreadNotifs)

      // Building a unit dictionary to group the cases together
      const unitsDict = caseList.sort(sorters[sortBy]).reduce((dict, caseItem) => {
        if (openFilter(caseItem) && assignedFilter(caseItem)) { // Filtering only the cases that match the selection
          const { selectedUnit: unitTitle, selectedUnitBzId: bzId, unitType } = caseItem

          // Pulling the existing or creating a new dictionary entry if none
          const unitDesc = dict[unitTitle] = dict[unitTitle] || {cases: [], bzId, unitType}
          const caseIdStr = caseItem.id.toString()

          // Adding the latest update time to the case for easier sorting later
          unitDesc.cases.push(
            Object.assign({
              latestUpdate: caseUpdateTimeDict[caseIdStr] || 0,
              unreadCounts: caseUnreadDict[caseIdStr]
            }, caseItem)
          )
        }
        return dict
      }, {})

      // Creating a case grouping *array* from the unit dictionary
      return Object.keys(unitsDict).reduce((all, unitTitle) => {
        const { bzId, cases, unitType } = unitsDict[unitTitle]

        // Sorting cases within a unit by the order descending order of last update
        cases.sort((a, b) => b.latestUpdate - a.latestUpdate)
        all.push({
          latestCaseUpdate: cases[0].latestUpdate, // The first case has to be latest due to the previous sort
          hasUnread: !!cases.find(caseItem => !!caseItem.unreadCounts), // true if any case has unreads
          items: cases,
          unitType,
          unitTitle,
          bzId
        })
        return all
      }, []).sort((a, b) => b.latestCaseUpdate - a.latestCaseUpdate) // Sorting by the latest case update for each
    },
    (a, b) => {
      if (a && b && Array.isArray(a)) {
        return a.length === b.length
      } else {
        return a === b
      }
    }
  )
  render () {
    const { isLoading, caseList, allNotifications, unreadNotifications } = this.props
    const { statusFilterValues, sortBy, open } = this.state
    if (isLoading) return <Preloader />
    const caseGrouping = this.makeCaseGrouping(caseList, statusFilterValues, sortBy, allNotifications, unreadNotifications)
    const cases = sortBy === 2 || 3 ? caseGrouping.sort(sorters[sortBy]) : caseGrouping
    return (
      <div className='flex flex-column roboto overflow-hidden flex-grow h-100 relative'>
        <UnverifiedWarning />
        <div className='flex bg-very-light-gray'>
          <SelectField
            multiple
            hintText='View: All Cases'
            value={statusFilterValues}
            onChange={this.handleFilterClicked}
            autoWidth
            underlineStyle={noUnderline}
            hintStyle={sortBoxInputStyle}
            iconStyle={selectInputIconStyle}
            labelStyle={sortBoxInputStyle}
            selectedMenuItemStyle={selectedItemStyle}
            dropDownMenuProps={{anchorOrigin: {vertical: 'bottom', horizontal: 'left'}}}
          >
            {this.filterMenu(statusFilterValues)}
          </SelectField>
          <SelectField
            hintText='Sort by: Date Added'
            value={sortBy}
            onChange={this.handleSortClicked}
            underlineStyle={noUnderline}
            hintStyle={sortBoxInputStyle}
            iconStyle={selectInputIconStyle}
            labelStyle={sortBoxInputStyle}
            selectedMenuItemStyle={selectedItemStyle}
            dropDownMenuProps={{anchorOrigin: {vertical: 'bottom', horizontal: 'left'}}}
          >
            {this.sortMenu(sortBy)}
          </SelectField>
        </div>
        <div className='bb b--black-10 overflow-auto flex-grow flex flex-column bg-very-light-gray pb6'>
          { !isLoading && cases.length
            ? <UnitGroupList
              unitGroupList={cases}
              expandedListRenderer={({allItems}) => (
                <CaseList
                  allCases={allItems}
                  onItemClick={this.handleOnItemClicked}
                />)
              }
              name={'case'}
            /> : (<NoItemMsg item={'case'} iconType={'card_travel'} buttonOption />)
          }
        </div>
        <div className='absolute right-1 bottom-2'>
          <FloatingActionButton onClick={() => this.setState({open: true})}>
            <FontIcon className='material-icons'>add</FontIcon>
          </FloatingActionButton>
          <UnitSelectDialog
            show={open}
            onDismissed={() => this.setState({open: false})}
            onUnitClick={this.handleOnUnitClicked}
          />
        </div>
      </div>
    )
  }
}

CaseExplorer.propTypes = {
  caseList: PropTypes.array,
  isLoading: PropTypes.bool,
  casesError: PropTypes.object,
  allNotifications: PropTypes.array.isRequired,
  unreadNotifications: PropTypes.array.isRequired,
  dispatchLoadingResult: PropTypes.func.isRequired
}

let casesError
const connectedWrapper = connect(
  () => ({}) // map redux state to props
)(createContainer(() => { // map meteor state to props
  const casesHandle = Meteor.subscribe(`${collectionName}.associatedWithMe`, {
    onStop: (error) => {
      casesError = error
    }
  })
  const notifsHandle = Meteor.subscribe(`${notifCollName}.myUpdates`)
  return {
    caseList: Cases.find().fetch().map(caseItem => Object.assign({}, caseItem, {
      unitType: (UnitMetaData.findOne({bzName: caseItem.selectedUnit}) || {}).unitType,
      selectedUnitBzId: (UnitMetaData.findOne({bzName: caseItem.selectedUnit}) || {}).bzId
    })),
    allNotifications: notifsHandle.ready() ? CaseNotifications.find().fetch() : [],
    unreadNotifications: notifsHandle.ready() ? CaseNotifications.find({
      markedAsRead: {$ne: true}
    }).fetch() : [],
    isLoading: !casesHandle.ready() || !notifsHandle.ready(),
    currentUser: Meteor.subscribe('users.myBzLogin').ready() ? Meteor.user() : null,
    casesError
  }
}, CaseExplorer))

connectedWrapper.MobileHeader = ({onIconClick}) => (
  <RootAppBar title='Cases' onIconClick={onIconClick} />
)

connectedWrapper.MobileHeader.propTypes = {
  onIconClick: PropTypes.func.isRequired
}

export default withRouter(connectedWrapper)
