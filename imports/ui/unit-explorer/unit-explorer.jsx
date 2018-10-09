import React, { Component } from 'react'
import { Meteor } from 'meteor/meteor'
import PropTypes from 'prop-types'
import UnverifiedWarning from '../components/unverified-warning'
import { connect } from 'react-redux'
import { createContainer } from 'meteor/react-meteor-data'
import { push } from 'react-router-redux'
import FontIcon from 'material-ui/FontIcon'
import RootAppBar from '../components/root-app-bar'
import Preloader from '../preloader/preloader'
import { setDrawerState } from '../general-actions'
import Units, { collectionName } from '../../api/units'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import FilteredUnits from './filtered-units'
import { SORT_BY, sorters } from '../explorer-components/sort-items'
import MenuItem from 'material-ui/MenuItem'
import { NoItemMsg } from '../explorer-components/no-item-msg'
import { FilterRow } from '../explorer-components/filter-row'

class UnitExplorer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      slideIndex: 0,
      searchResult: [],
      searchMode: false,
      searchText: '',
      statusFilterValues: [],
      roleFilterValues: [],
      sortBy: null
    }
  }

  sortMenu (sortBy) {
    const labels = [
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

  handleAddCaseClicked = (id) => {
    const { dispatch } = this.props
    dispatch(push(`/case/new?unit=${id}`))
  }

  handleUnitClicked = (id) => {
    const { dispatch } = this.props
    dispatch(push(`/unit/${id}`))
  }

  onSearchChanged = (searchText) => {
    this.setState({searchText})
    if (searchText === '') {
      this.setState({searchMode: false})
    } else {
      this.setState({searchMode: true})
      const matcher = new RegExp(searchText, 'i')
      const searchResult = this.props.unitList
        .filter(unit => !matcher || (unit.name && unit.name.match(matcher)))
      this.setState({
        searchResult: searchResult
      })
    }
  }

  get filteredUnits () {
    const { statusFilterValues, sortBy, roleFilterValues } = this.state
    const { unitList, currentUserId } = this.props
    const statusFilter = statusFilterValues.length === 4 || (statusFilterValues.includes('Active') && statusFilterValues.includes('Disabled'))
      ? unitItem => true
      : statusFilterValues.includes('Active') ? unitItem => unitItem.is_active
        : statusFilterValues.includes('Disabled') ? unitItem => !unitItem.is_active
          : unitItem => true
    const roleFilter = roleFilterValues.length === 2 || (roleFilterValues.includes('Created') && roleFilterValues.includes('Involved'))
      ? unitItem => true
      : roleFilterValues.includes('Created') ? unitItem => unitItem.metaData && unitItem.metaData.ownerIds && unitItem.metaData.ownerIds[0] === currentUserId
        : roleFilterValues.includes('Involved') ? unitItem => ((unitItem.metaData && !unitItem.metaData.ownerIds) ||
        (unitItem.metaData && !unitItem.metaData.ownerIds && !unitItem.metaData.ownerIds[0] === currentUserId)) : unitItem => true
    const filteredUnits = unitList.filter(unitItem => roleFilter(unitItem) && statusFilter(unitItem)).sort(sorters[sortBy])
    return filteredUnits
  }

  render () {
    const { isLoading, dispatch, unitList } = this.props
    const { filteredUnits } = this
    const defaultUnitList = unitList.filter(unitItem => unitItem.is_active).sort(sorters['2'])
    const { searchResult, searchMode, searchText, statusFilterValues, roleFilterValues, sortBy } = this.state
    const units = statusFilterValues.length !== 0 || roleFilterValues.length !== 0 || sortBy !== null ? filteredUnits : defaultUnitList
    if (isLoading) return <Preloader />
    return (
      <div className='flex flex-column flex-grow full-height'>
        <RootAppBar
          title='My Units'
          placeholder='Search units...'
          onIconClick={() => dispatch(setDrawerState(true))}
          shadowless
          searchText={searchText}
          onSearchChanged={this.onSearchChanged}
          showSearch
        />
        <UnverifiedWarning />
        { searchMode ? (
          <FilteredUnits filteredUnits={searchResult}
            handleUnitClicked={this.handleUnitClicked}
          />
        ) : (
          <div className='flex-grow flex flex-column overflow-hidden'>
            <FilterRow
              statusFilterValues={statusFilterValues}
              roleFilterValues={roleFilterValues}
              onFilterClicked={this.handleStatusFilterClicked}
              onRoleFilterClicked={this.handleRoleFilterClicked}
              onSortClicked={this.handleSortClicked}
              sortBy={sortBy}
              status={['Active', 'Disabled']}
              roles={['Created', 'Involved']}
              labels={[
                [SORT_BY.NAME_ASCENDING, 'Name (A to Z)'],
                [SORT_BY.NAME_DESCENDING, 'Name (Z to A)']
              ]}
            />
            <div className='flex-grow flex flex-column overflow-auto'>
              <div className='flex-grow bb b--very-light-gray bg-white pb6'>
                { filteredUnits.length === 0 ? (
                  <NoItemMsg item={'unit'} iconType={'location_on'} />
                ) : (
                  <FilteredUnits
                    filteredUnits={units}
                    handleUnitClicked={this.handleUnitClicked}
                    handleAddCaseClicked={this.handleAddCaseClicked}
                    showAddBtn
                  />
                )
                }
              </div>
            </div>
          </div>
        ) }
        <div className='absolute bottom-2 right-2'>
          <FloatingActionButton
            onClick={() => dispatch(push(`/unit/new`))}
          >
            <FontIcon className='material-icons'>add</FontIcon>
          </FloatingActionButton>
        </div>
      </div>
    )
  }
}

UnitExplorer.propTypes = {
  unitList: PropTypes.array,
  isLoading: PropTypes.bool,
  unitsError: PropTypes.object,
  currentUserId: PropTypes.string
}

let unitsError
export default connect(
  () => ({}) // Redux store to props
)(createContainer(
  () => {
    const unitsHandle = Meteor.subscribe(`${collectionName}.forBrowsing`, {
      onStop: (error) => {
        unitsError = error
      }
    })
    return {
      unitList: Units.find().fetch().map(unit => Object.assign({}, unit, {
        metaData: unit.metaData()
      })),
      isLoading: !unitsHandle.ready(),
      currentUserId: Meteor.userId(),
      unitsError
    }
  }, // Meteor data to props
  UnitExplorer
))
