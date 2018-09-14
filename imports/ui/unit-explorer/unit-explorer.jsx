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
import { Tabs, Tab } from 'material-ui/Tabs'
import SwipeableViews from 'react-swipeable-views'
import FilteredUnitsList from './filtered-units-list'
import MenuItem from 'material-ui/MenuItem'
import UnitTypeIcon from './unit-type-icon'
import { resetMenuItemDivStyle } from '../general.mui-styles'

class SearchResult extends Component {
  constructor (props) {
    super(props)
    this.state = {
      ready: false
    }
  }

  componentDidUpdate (prevProps) {
    const { unitsFound } = this.props
    if (prevProps.unitsFound.length !== unitsFound.length) {
      this.setState({ready: true})
    }
  }

  render () {
    const { ready } = this.state
    const { unitsFound } = this.props
    return (
      <div className='flex-grow flex flex-column overflow-hidden'>
        { ready && unitsFound.map(({ id, name, description, metaData }) => (
          <MenuItem key={id} innerDivStyle={resetMenuItemDivStyle} onClick={() => handleUnitClicked(id)} >
            <div className='mt2 ph2 bb b--very-light-gray br1 w-100 flex items-center pa2'>
              <UnitTypeIcon metaData={metaData} />
              <div className='ml3 mv1 semi-dark-gray lh-copy flex-grow overflow-hidden'>
                <div className='ti1 ellipsis'>{metaData.displayName || name}</div>
                <div className='ti1 ellipsis silver'>{ metaData.moreInfo || description}&nbsp;</div>
              </div>
            </div>
          </MenuItem>
        ))
        }
      </div>
    )
  }
}

class UnitExplorer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      slideIndex: 0,
      searchResult: [],
      searchEnabled: false
    }
  }

  handleChange = (value) => {
    this.setState({
      slideIndex: value
    })
  };

  handleAddCaseClicked = (id) => {
    const { dispatch } = this.props
    dispatch(push(`/case/new?unit=${id}`))
  }

  handleUnitClicked = (id) => {
    const { dispatch } = this.props
    dispatch(push(`/unit/${id}`))
  }

  findUnit = (searchText) => {
    if (searchText === '') {
      this.setState({searchResult: []})
    } else {
      this.setState({searchEnabled: true})
      const matcher = new RegExp(searchText, 'i')
      const searchResult = this.props.unitList
        .map((u, idx) => Object.assign(u, { origIdx: idx }))
        .filter(unit => !matcher || (unit.name && unit.name.match(matcher)))
      this.setState({searchResult})
    }
  }

  searchOff = () => {
    this.setState({searchResult: []})
  }
  render () {
    const { isLoading, unitList, dispatch, currentUserId } = this.props
    const { searchResult } = this.state
    if (isLoading) return <Preloader />
    const activeUnits = unitList.filter(unitItem => unitItem.metaData && !unitItem.metaData.disabled)
    const disabledUnits = unitList.filter(unitItem => unitItem.metaData && unitItem.metaData.disabled)
    return (
      <div className='flex flex-column flex-grow full-height'>
        <RootAppBar title='My Units' onIconClick={() => dispatch(setDrawerState(true))} shadowless findUnit={this.findUnit} searchOff={this.searchOff} />
        {searchResult.length > 0 ? (
          <SearchResult unitsFound={searchResult} />
        ) : (
          <div>
            <UnverifiedWarning />
            <div className='flex-grow flex flex-column overflow-hidden'>
              <Tabs
                className='no-shrink'
                onChange={this.handleChange}
                value={this.state.slideIndex}
                inkBarStyle={{backgroundColor: 'white'}}
              >
                <Tab label='Active' value={0} />
                <Tab label='Disabled' value={1} />
              </Tabs>

              <div className='flex-grow flex flex-column overflow-auto'>
                <SwipeableViews
                  index={this.state.slideIndex}
                  onChangeIndex={this.handleChange}
                >
                  {/* tab 1 */}
                  <div className='flex-grow bb b--very-light-gray bg-white pb6'>
                    <FilteredUnitsList
                      filteredUnits={activeUnits}
                      currentUserId={currentUserId}
                      handleUnitClicked={this.handleUnitClicked}
                      handleAddCaseClicked={this.handleAddCaseClicked}
                      showAddBtn
                      active
                    />
                  </div>
                  {/* tab 2 */}
                  <div className='flex-grow bb b--very-light-gray bg-white pb6'>
                    <FilteredUnitsList
                      filteredUnits={disabledUnits}
                      currentUserId={currentUserId}
                      handleUnitClicked={this.handleUnitClicked}
                    />
                  </div>
                </SwipeableViews>
              </div>
            </div>
            <div className='absolute bottom-2 right-2'>
              <FloatingActionButton
                onClick={() => dispatch(push(`/unit/new`))}
              >
                <FontIcon className='material-icons'>add</FontIcon>
              </FloatingActionButton>
            </div>
          </div>
        )}
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
