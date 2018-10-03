import React, { Component } from 'react'
import { Meteor } from 'meteor/meteor'
import { connect } from 'react-redux'
import { createContainer } from 'meteor/react-meteor-data'
import PropTypes from 'prop-types'
import RootAppBar from '../components/root-app-bar'
import memoizeOne from 'memoize-one'
import Reports, { collectionName, REPORT_DRAFT_STATUS } from '../../api/reports'
import Preloader from '../preloader/preloader'
import { setDrawerState, storeBreadcrumb } from '../general-actions'
import { NoItemMsg } from '../explorer-components/no-item-msg'
// import { FilterRow } from '../explorer-components/filter-row'
import { UnitGroupList } from '../explorer-components/unit-group-list'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import FontIcon from 'material-ui/FontIcon'
import { ReportList } from '../report-explorer/report-list'
import UnitSelectDialog from '../dialogs/unit-select-dialog'
import { push } from 'react-router-redux'
import MenuItem from 'material-ui/MenuItem'
// import { Link } from 'react-router-dom'
// import {ReportIcon} from '../report/report-icon'
// import moment from 'moment'
import SelectField from 'material-ui/SelectField'
import {
  selectInputIconStyle,
  noUnderline,
  sortBoxInputStyle,
  selectedItemStyle
} from '../components/form-controls.mui-styles'
import { SORT_BY, sorters } from '../explorer-components/sort-items'

class ReportExplorer extends Component {
  constructor () {
    super(...arguments)
    this.state = {
      myInvolvement: false,
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

  reportFilterMenu (statusFilterValues) {
    const status = ['Draft', 'Finalized', 'Created By Me']
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

  handleOnItemClicked = () => {
    const { dispatch, match } = this.props
    dispatch(storeBreadcrumb(match.url))
  }

  handleOnUnitClicked = (unitId) => {
    const { dispatch } = this.props
    dispatch(push(`/unit/${unitId}/reports/new`))
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

  makeReportGrouping = memoizeOne(
    (reportList, statusFilterValues, sortBy) => {
      const statusFilter = statusFilterValues.length === 3 || (statusFilterValues.includes('Draft') && statusFilterValues.includes('Finalized')) ? report => true
        : statusFilterValues.includes('Draft') ? report => report.status === REPORT_DRAFT_STATUS
          : statusFilterValues.includes('Finalized') ? report => report.status !== REPORT_DRAFT_STATUS : report => true
      const creatorFilter = statusFilterValues.includes('Created By Me') ? x => x.assignee === this.props.currentUser.bugzillaCreds.login : x => true
      const unitDict = reportList.sort(sorters[sortBy]).reduce((dict, reportItem) => {
        if (statusFilter(reportItem) && creatorFilter(reportItem)) {
          const { selectedUnit: unitBzName, unitMetaData: metaData } = reportItem
          const unitType = metaData ? metaData.unitType : 'not_listed'
          const bzId = metaData ? metaData.bzId : 'not_listed'
          const unitTitle = metaData && metaData.displayName ? metaData.displayName : unitBzName
          const unitDesc = dict[unitBzName] = dict[unitBzName] || {items: [], unitType, bzId, unitTitle}
          unitDesc.items.push(reportItem)
        }
        return dict
      }, {})

      return Object.values(unitDict)
    }
  )

  render () {
    const { isLoading, dispatch, reportList } = this.props
    const { statusFilterValues, open, sortBy } = this.state
    if (isLoading) return <Preloader />
    const reportGrouping = this.makeReportGrouping(reportList, statusFilterValues, sortBy)
    return (
      <div className='flex flex-column flex-grow full-height'>
        <RootAppBar title='My Reports' onIconClick={() => dispatch(setDrawerState(true))} shadowless />
        <div className='flex flex-column roboto overflow-hidden flex-grow h-100 relative'>
          <div className='flex bg-very-light-gray'>
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
              {this.reportFilterMenu(statusFilterValues)}
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
          <div className='bb b--black-10 overflow-auto flex-grow flex flex-column bg-very-light-gray pb6'>
            { reportGrouping.length
              ? <UnitGroupList
                unitGroupList={reportGrouping}
                expandedListRenderer={({allItems}) => (
                  <ReportList
                    allReports={allItems}
                    onItemClick={this.handleOnItemClicked}
                  />)
                }
                name={'report'}
              /> : (<NoItemMsg item={'report'} buttonOption />)
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
      </div>
    )
  }
}

ReportExplorer.propTypes = {
  reportList: PropTypes.array
}

let reportsError
export default connect(
  () => ({}) // map redux state to props
)(createContainer(() => { // map meteor state to props
  const reportsHandle = Meteor.subscribe(`${collectionName}.associatedWithMe`, {
    onStop: (error) => {
      reportsError = error
    }
  })
  return {
    reportList: Reports.find().fetch().map(report => ({
      unitMetaData: report.unitMetaData(),
      ...report
    })),
    isLoading: !reportsHandle.ready(),
    currentUser: Meteor.subscribe('users.myBzLogin').ready() ? Meteor.user() : null,
    reportsError
  }
}, ReportExplorer))
