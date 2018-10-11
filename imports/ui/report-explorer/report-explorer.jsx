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
import { UnitGroupList } from '../explorer-components/unit-group-list'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import FontIcon from 'material-ui/FontIcon'
import { ReportList } from '../report-explorer/report-list'
import UnitSelectDialog from '../dialogs/unit-select-dialog'
import { push } from 'react-router-redux'
import { FilterRow } from '../explorer-components/filter-row'
import { SORT_BY, sorters } from '../explorer-components/sort-items'

class ReportExplorer extends Component {
  constructor () {
    super(...arguments)
    this.state = {
      open: false,
      statusFilterValues: null,
      roleFilterValues: null,
      sortBy: null
    }
  }

  handleStatusFilterClicked = (event, index, statusFilterValues) => {
    this.setState({
      statusFilterValues: statusFilterValues
    })
  }

  handleRoleFilterClicked = (event, index, roleFilterValues) => {
    this.setState({
      roleFilterValues: roleFilterValues
    })
  }

  handleSortClicked = (event, index, value) => {
    this.setState({
      sortBy: value
    })
  }

  handleOnItemClicked = () => {
    const { dispatch, match } = this.props
    dispatch(storeBreadcrumb(match.url))
  }

  handleOnUnitClicked = (unitId) => {
    const { dispatch } = this.props
    dispatch(push(`/unit/${unitId}/reports/new`))
  }

  makeReportGrouping = memoizeOne(
    (reportList, statusFilterValues, roleFilterValues, sortBy) => {
      const statusFilter = statusFilterValues === 'All' ? report => true
        : statusFilterValues === 'Draft' ? report => report.status === REPORT_DRAFT_STATUS
          : statusFilterValues === 'Finalized' ? report => report.status !== REPORT_DRAFT_STATUS : report => true
      const creatorFilter = roleFilterValues === 'All' ? report => true
        : roleFilterValues === 'Created' ? report => report.assignee === this.props.currentUser.bugzillaCreds.login : report => true
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
    const { statusFilterValues, roleFilterValues, open, sortBy } = this.state
    if (isLoading) return <Preloader />
    const reportGrouping = this.makeReportGrouping(reportList, statusFilterValues, roleFilterValues, sortBy)
    const defaultReportList = reportGrouping.sort(sorters[SORT_BY.NAME_ASCENDING])
    const reports = sortBy === null ? defaultReportList
      : sortBy === SORT_BY.NAME_ASCENDING || SORT_BY.NAME_DESCENDING ? reportGrouping.sort(sorters[sortBy]) : reportGrouping

    return (
      <div className='flex flex-column flex-grow full-height'>
        <RootAppBar title='My Reports' onIconClick={() => dispatch(setDrawerState(true))} shadowless />
        <div className='flex flex-column roboto overflow-hidden flex-grow h-100 relative'>
          <FilterRow
            statusFilterValues={statusFilterValues}
            roleFilterValues={roleFilterValues}
            onFilterClicked={this.handleStatusFilterClicked}
            onRoleFilterClicked={this.handleRoleFilterClicked}
            onSortClicked={this.handleSortClicked}
            sortBy={sortBy}
            status={['All', 'Draft', 'Finalized']}
            roles={['All', 'Created']}
            rolesPrimaryText={['All', 'Created by me']}
          />
          <div className='bb b--black-10 overflow-auto flex-grow flex flex-column bg-very-light-gray pb6'>
            { reports.length
              ? <UnitGroupList
                unitGroupList={reports}
                expandedListRenderer={({allItems}) => (
                  <ReportList
                    allReports={allItems}
                    onItemClick={this.handleOnItemClicked}
                  />)
                }
                name={'report'}
              /> : (<NoItemMsg item={'report'} iconType={'content_paste'} buttonOption />)
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
