import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import { push, goBack } from 'react-router-redux'
import { Route, Link } from 'react-router-dom'
import { Tabs, Tab } from 'material-ui/Tabs'
import SwipeableViews from 'react-swipeable-views'
import MenuItem from 'material-ui/MenuItem'
import FontIcon from 'material-ui/FontIcon'
import { CSSTransition } from 'react-transition-group'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import moment from 'moment'
import Units, { collectionName as unitsCollName, getUnitRoles } from '../../api/units'
import Cases, { isClosed, collectionName as casesCollName } from '../../api/cases'
import Reports, { collectionName as reportsCollName, REPORT_DRAFT_STATUS } from '../../api/reports'
import { placeholderEmailMatcher } from '../../util/matchers'
import InnerAppBar from '../components/inner-app-bar'
import CreateReportDialog from '../dialogs/create-report-dialog'
import { makeMatchingUser } from '../../api/custom-users'
import Preloader from '../preloader/preloader'
import { infoItemMembers } from '../util/static-info-rendering'
import { userInfoItem } from '../../util/user'
import { storeBreadcrumb } from '../general-actions'
import CaseMenuItem from '../components/case-menu-item'
import {ReportIcon} from '../report/report-icon'
import SelectField from 'material-ui/SelectField'
import { SORT_BY, sorters } from '../explorer-components/sort-items'
import {
  selectInputIconStyle,
  noUnderline,
  sortBoxInputStyle,
  selectedItemStyle
} from '../components/form-controls.mui-styles'

import {
  menuItemDivStyle
} from '../general.mui-styles'

function NoItem ({item, iconType}) {
  return (
    <div className='mt5 pt3 tc'>
      <div className='dib relative'>
        <FontIcon className='material-icons' color='var(--moon-gray)' style={{fontSize: '5rem'}}>
          {iconType}
        </FontIcon>
        <div className='absolute bottom-0 right-0 pb1'>
          <div className='br-100 ba b--very-light-gray bg-very-light-gray lh-cram'>
            <FontIcon className='material-icons' color='var(--moon-gray)' style={{fontSize: '2.5rem'}}>
              add_circle_outline
            </FontIcon>
          </div>
        </div>
      </div>
      <div className='mid-gray b lh-copy'>
        You have no {item}s yet
      </div>
    </div>
  )
}

const viewsOrder = ['cases', 'reports', 'overview']

const severityIndex = [
  'DEAL BREAKER!',
  'critical',
  'major',
  'normal',
  'minor'
]

class Unit extends Component {
  constructor () {
    super(...arguments)
    this.state = {
      sortedCases: [],
      statusFilterValues: [],
      sortBy: null
    }
  }

  get filteredCases () {
    const { sortedCases, statusFilterValues, sortBy } = this.state
    const statusFilter = statusFilterValues.length === 3 || (statusFilterValues.includes('Open') && statusFilterValues.includes('Closed'))
      ? x => true
      : statusFilterValues.includes('Open') ? x => !isClosed(x)
        : statusFilterValues.includes('Closed') ? x => isClosed(x) : x => true
    const assignedFilter = statusFilterValues.includes('Created By Me') ? x => x.assignee === this.props.currentUser.bugzillaCreds.login : x => true
    const filteredCases = sortedCases.filter(caseItem => assignedFilter(caseItem) && statusFilter(caseItem)).sort(sorters[sortBy])
    return filteredCases
  }

  handleFilterClicked = (event, index, statusFilterValues) => {
    this.setState({
      statusFilterValues: statusFilterValues
    })
  }

  handleChange = val => {
    const { match, dispatch } = this.props
    dispatch(push(`${match.url}/${viewsOrder[val]}`))
  }

  componentWillReceiveProps (nextProps) {
    const { caseList } = this.props
    if ((!caseList && nextProps.caseList) || (caseList && caseList.length !== nextProps.caseList.length)) {
      this.setState({
        sortedCases: nextProps.caseList.slice().sort((a, b) =>
          severityIndex.indexOf(a.severity) - severityIndex.indexOf(b.severity)
        )
      })
    }
  }

  handleSortClicked = (event, index, value) => {
    this.setState({
      sortBy: value
    })
  }

  filterMenu (options, statusFilterValues) {
    return options.map((name) => (
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

  filteredReportItems () {
    const { reportList, currentUser } = this.props
    const { statusFilterValues, sortBy } = this.state
    const statusFilter = statusFilterValues.length === 3 || (statusFilterValues.includes('Draft') && statusFilterValues.includes('Finalized')) ? report => true
      : statusFilterValues.includes('Draft') ? report => report.status === REPORT_DRAFT_STATUS
        : statusFilterValues.includes('Finalized') ? report => report.status !== REPORT_DRAFT_STATUS : report => true
    const creatorFilter = statusFilterValues.includes('Created By Me') ? report => report.assignee === currentUser.bugzillaCreds.login : report => true
    const filteredReports = reportList.filter(reportItem => creatorFilter(reportItem) && statusFilter(reportItem))
      .sort(sorters[sortBy])
    return filteredReports.map(({ id, title, status, creation_time: date }) => {
      const isFinalized = status !== REPORT_DRAFT_STATUS
      const viewMode = isFinalized ? 'preview' : 'draft'
      return (
        <div key={id} className='relative bb b--very-light-gray bg-white flex items-center'>
          <Link to={`/report/${id}/${viewMode}`} className='link flex-grow relative w-100'>
            <MenuItem innerDivStyle={menuItemDivStyle}>
              <div className='pv2 flex-grow flex items-center w-100'>
                <ReportIcon isFinalized={isFinalized} />
                <div className='ml3 lh-copy pv1 flex-grow overflow-hidden'>
                  <div className='mid-gray ellipsis'>{title}</div>
                  <div className='silver mt1 f7 ellipsis'>
                    Created on {moment(date).format('YYYY-MM-DD')}
                  </div>
                </div>
              </div>
            </MenuItem>
          </Link>
        </div>
      )
    })
  }

  render () {
    const {
      unitItem, isLoading, unitError, casesError, unitUsers, caseList, reportList, reportsError, dispatch, match
    } = this.props
    const { sortedCases, statusFilterValues, sortBy } = this.state
    const { filteredCases } = this
    const rootMatch = match
    const { unitId } = match.params

    if (isLoading) return <Preloader />
    if (unitError) return <h1>An error occurred: {unitError.error}</h1>
    if (casesError) return <h1>An error occurred: {casesError.error}</h1>
    if (reportsError) return <h1>An error occurred: {reportsError.error}</h1>

    const fabDescriptors = [
      {
        color: 'var(--bondi-blue)',
        href: `/case/new?unit=${unitId}`,
        icon: 'add'
      },
      {
        color: 'var(--bondi-blue)',
        href: `${rootMatch.url}/${viewsOrder[1]}/new`,
        icon: 'add'
      }
    ]

    const metaData = unitItem.metaData() || {}
    const unitName = metaData.displayName || unitItem.name

    return (
      <div className='full-height flex flex-column'>
        <InnerAppBar
          shadowless
          title={unitName}
          onBack={() => dispatch(push(match.url.split('/').slice(0, -1).join('/')))}
        />
        <Route path={`${rootMatch.url}/:viewName`} children={({ match }) => {
          const viewIdx = match ? viewsOrder.indexOf(match.params.viewName) : 0
          return (
            <div className='flex-grow flex flex-column overflow-hidden'>
              <Tabs
                className='no-shrink'
                onChange={this.handleChange}
                value={viewIdx}
                inkBarStyle={{backgroundColor: 'white'}}
              >
                <Tab label={`CASES (${sortedCases.length})`} value={0} />
                <Tab label={`REPORTS (${reportList.length})`} value={1} />
                <Tab label='OVERVIEW' value={2} />
              </Tabs>
              <div className='flex-grow flex flex-column overflow-auto'>
                <SwipeableViews
                  resistance
                  style={{flex: 1, display: 'flex', flexDirection: 'column'}}
                  containerStyle={{flex: 1}}
                  slideStyle={{display: 'flex', flexDirection: 'column'}}
                  index={viewIdx}
                  onChangeIndex={this.handleChange}
                >

                  <div className='flex-grow bg-very-light-gray'>
                    { caseList.length ? (
                      <div>
                        <div className='flex flex-grow'>
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
                          >
                            {this.filterMenu(['Open', 'Closed', 'Assigned To Me'], statusFilterValues)}
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
                          >
                            {this.sortMenu(sortBy)}
                          </SelectField>
                        </div>
                        { filteredCases.map(caseItem => (
                          <CaseMenuItem
                            key={caseItem.id}
                            className='ph3'
                            caseItem={caseItem}
                            onClick={() => {
                              dispatch(storeBreadcrumb(rootMatch.url))
                              dispatch(push(`/case/${caseItem.id}`))
                            }}
                          />
                        ))
                        }
                      </div>
                    ) : (<NoItem item='case' iconType='card_travel' />)
                    }
                  </div>
                  <div className='flex-grow bg-very-light-gray'>
                    {reportList.length ? (
                      <div>
                        <div className='flex flex-grow'>
                          <SelectField
                            multiple
                            hintText='View: All Reports'
                            value={statusFilterValues}
                            onChange={this.handleFilterClicked}
                            autoWidth
                            underlineStyle={noUnderline}
                            hintStyle={sortBoxInputStyle}
                            iconStyle={selectInputIconStyle}
                            labelStyle={sortBoxInputStyle}
                            selectedMenuItemStyle={selectedItemStyle}
                          >
                            {this.filterMenu(['Draft', 'Finalized', 'Created By Me'], statusFilterValues)}
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
                          >
                            {this.sortMenu(sortBy)}
                          </SelectField>
                        </div>
                        {this.filteredReportItems()}
                      </div>
                    ) : (
                      <NoItem item='inspection report' iconType='content_paste' />
                    )}
                    <Route exact path={`${rootMatch.url}/${viewsOrder[1]}/new`} children={({ match }) => (
                      <CreateReportDialog
                        show={!!match}
                        onDismissed={() => dispatch(goBack())}
                        unitName={unitItem.name}
                      />
                    )} />
                  </div>
                  <div className='flex-grow bg-very-light-gray'>
                    <div className='bg-white card-shadow-1 pa3'>
                      <div>
                        {infoItemMembers('Unit name', unitName)}
                      </div>
                      <div className='mt3'>
                        {infoItemMembers('Unit group', unitItem.classification)}
                      </div>
                      <div className='mt3'>
                        {infoItemMembers('Unit type', metaData.unitType)}
                      </div>
                      <div className='mt3'>
                        {infoItemMembers('Additional description', metaData.moreInfo || unitItem.description)}
                      </div>
                    </div>
                    <div className='mt2 bg-white card-shadow-1 pa3'>
                      <div className='fw5 silver lh-title'>
                        ADDRESS
                      </div>
                      <div className='mt1'>
                        {infoItemMembers('Address', metaData.streetAddress)}
                      </div>
                      <div className='mt3'>
                        {infoItemMembers('City', metaData.city)}
                      </div>
                      <div className='mt3'>
                        {infoItemMembers('Country', metaData.country)}
                      </div>
                      <div className='mt3 flex'>
                        <div className='flex-grow'>
                          {infoItemMembers('State', metaData.state)}
                        </div>
                        <div className='flex-grow'>
                          {infoItemMembers('Zip / Postal code', metaData.zipCode)}
                        </div>
                      </div>
                    </div>
                    <div className='mt2 bg-white card-shadow-1 pa3'>
                      <div className='fw5 silver lh-title'>
                        PEOPLE
                      </div>
                      {unitUsers
                        .filter(user => (
                          !placeholderEmailMatcher(user.login)
                        ))
                        .map(user => (
                          <div className='mt1' key={user.login}>{userInfoItem(user)}</div>
                        ))
                      }
                    </div>
                  </div>
                </SwipeableViews>
              </div>

              {fabDescriptors.map((desc, ind) => (
                <div key={ind} className='absolute bottom-1 right-1'>
                  <CSSTransition in={viewIdx === ind} timeout={500} classNames='zoom-effect' unmountOnExit>
                    <FloatingActionButton
                      backgroundColor={desc.color}
                      className='zoom-effect'
                      onClick={() => dispatch(push(desc.href))}
                    >
                      <FontIcon className='material-icons'>{desc.icon}</FontIcon>
                    </FloatingActionButton>
                  </CSSTransition>
                </div>
              ))}
            </div>
          )
        }} />
      </div>
    )
  }
}
Unit.propTypes = {
  unitItem: PropTypes.object,
  unitError: PropTypes.object,
  casesError: PropTypes.object,
  reportsError: PropTypes.object,
  isLoading: PropTypes.bool,
  unitUsers: PropTypes.array,
  caseList: PropTypes.array,
  reportList: PropTypes.array
}

let unitError, casesError, reportsError
export default connect(
  () => ({})
)(createContainer((props) => {
  const { unitId } = props.match.params
  const unitHandle = Meteor.subscribe(`${unitsCollName}.byIdWithUsers`, unitId, {
    onStop: error => {
      unitError = error
    }
  })
  const unitItem = unitHandle.ready() ? Units.findOne({id: parseInt(unitId)}) : null
  let casesHandle, reportsHandle
  if (unitItem) {
    casesHandle = Meteor.subscribe(`${casesCollName}.byUnitName`, unitItem.name, {
      onStop: error => {
        casesError = error
      }
    })
    reportsHandle = Meteor.subscribe(`${reportsCollName}.byUnitName`, unitItem.name, {
      onStop: error => {
        reportsError = error
      }
    })
  }
  return {
    isLoading: !unitHandle.ready() || !casesHandle.ready() || !reportsHandle.ready(),
    unitUsers: unitItem ? getUnitRoles(unitItem).map(makeMatchingUser) : null,
    caseList: unitItem ? Cases.find({selectedUnit: unitItem.name}).fetch() : null,
    reportList: unitItem ? Reports.find({selectedUnit: unitItem.name}).fetch() : null,
    currentUser: Meteor.subscribe('users.myBzLogin').ready() ? Meteor.user() : null,
    reportsError,
    casesError,
    unitError,
    unitItem
  }
}, Unit))
