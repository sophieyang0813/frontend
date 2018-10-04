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
import SelectField from 'material-ui/SelectField'
import {
  selectInputIconStyle,
  noUnderline,
  sortBoxInputStyle,
  selectedItemStyle
} from '../components/form-controls.mui-styles'

class UnitExplorer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      slideIndex: 0,
      searchResult: [],
      searchMode: false,
      searchText: '',
      statusFilterValues: []
    }
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

  filterMenu (hintText, options, statusFilterValues) {
    return (
      <SelectField
        multiple
        hintText={hintText}
        value={statusFilterValues}
        onChange={this.handleFilterClicked}
        autoWidth
        underlineStyle={noUnderline}
        hintStyle={sortBoxInputStyle}
        iconStyle={selectInputIconStyle}
        labelStyle={sortBoxInputStyle}
        selectedMenuItemStyle={selectedItemStyle}
      >
        { options.map((name) => (
          <MenuItem
            key={name}
            insetChildren
            checked={statusFilterValues && statusFilterValues.indexOf(name) > -1}
            value={name}
            primaryText={name}
          />
        ))
        }
      </SelectField>
    )
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
    const { statusFilterValues, sortBy } = this.state
    const { unitList, currentUserId } = this.props
    const statusFilter = statusFilterValues.length === 4 || (statusFilterValues.includes('Active') && statusFilterValues.includes('Disabled'))
      ? unitItem => true
      : statusFilterValues.includes('Active') ? unitItem => unitItem.metaData && !unitItem.metaData.disabled
        : statusFilterValues.includes('Disabled') ? unitItem => unitItem.metaData && unitItem.metaData.disabled : unitItem => true
    const roleFilter = statusFilterValues.length === 4 || (statusFilterValues.includes('Created') && statusFilterValues.includes('Involved'))
      ? unitItem => true
      : statusFilterValues.includes('Created') ? unitItem => unitItem.metaData && unitItem.metaData.ownerIds && unitItem.metaData.ownerIds[0] === currentUserId
        : statusFilterValues.includes('Involved') ? unitItem => ((unitItem.metaData && !unitItem.metaData.ownerIds) ||
        (unitItem.metaData && !unitItem.metaData.ownerIds && !unitItem.metaData.ownerIds[0] === currentUserId)) : unitItem => true
    const filteredUnits = unitList.filter(unitItem => roleFilter(unitItem) && statusFilter(unitItem)).sort(sorters[sortBy])
    return filteredUnits
  }

  render () {
    const { filteredUnits } = this
    const { isLoading, dispatch } = this.props
    const { searchResult, searchMode, searchText, statusFilterValues, sortBy } = this.state
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
            <div className='flex bg-very-light-gray'>
              {this.filterMenu('Status', ['Active', 'Disabled'], statusFilterValues)}
              {this.filterMenu('My role', ['Created', 'Involved'], statusFilterValues)}
              <SelectField
                hintText='Sort by'
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
            <div className='flex-grow flex flex-column overflow-auto'>
              <div className='flex-grow bb b--very-light-gray bg-white pb6'>
                { filteredUnits.length === 0 ? (
                  <NoItemMsg item={'unit'} iconType={'location_on'} />
                ) : (
                  <FilteredUnits
                    filteredUnits={filteredUnits}
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
