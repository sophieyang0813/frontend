import React, { Component } from 'react'
import PropTypes from 'prop-types'
import MenuItem from 'material-ui/MenuItem'
import UnitTypeIcon from './unit-type-icon'

import { resetMenuItemDivStyle } from '../general.mui-styles'

export default class FilteredUnits extends Component {
  constructor (props) {
    super(props)
    this.state = {
      ready: false
    }
  }

  componentDidUpdate (prevProps) {
    const { searchResult } = this.props
    if ((prevProps.searchResult && prevProps.searchResult.length) !== (searchResult && searchResult.length)) {
      this.setState({ready: true})
    }
  }

  render () {
    const { unitsByRoles, searchResult, showAddBtn, handleUnitClicked, handleAddCaseClicked, administrate } = this.props
    const { ready } = this.state
    const filteredUnits = unitsByRoles || searchResult
    return (
      <div className='flex-grow flex flex-column overflow-auto'>
        {(filteredUnits.length !== 0 && searchResult === undefined) && (
          <div className='bb b--black-10 bg-very-light-gray f6 fw5 mid-gray pv2 pl2'>
            { administrate ? ('Units I Administrate') : ('Units Involved In') }
          </div>)
        }
        { ((ready && searchResult) || unitsByRoles) &&
          filteredUnits.map(({ id, name, description, metaData }) => (
            <MenuItem key={id} innerDivStyle={resetMenuItemDivStyle} onClick={() => handleUnitClicked(id)} >
              <div className='mt2 ph2 bb b--very-light-gray br1 w-100 flex items-center pa2'>
                <UnitTypeIcon metaData={metaData} />
                <div className='ml3 mv1 semi-dark-gray lh-copy flex-grow overflow-hidden'>
                  <div className='ti1 ellipsis'>{name}</div>
                  <div className='ti1 ellipsis silver'>{description}&nbsp;</div>
                </div>
                { showAddBtn && (
                  <div
                    onClick={(evt) => { evt.stopPropagation(); handleAddCaseClicked(id) }}
                    className='f6 ellipsis ml3 pl1 mv1 bondi-blue fw5 no-shrink'
                  >
                    Add case
                  </div>
                )}
              </div>
            </MenuItem>
          ))
        }
      </div>
    )
  }
}

FilteredUnits.propTypes = {
  unitsByRoles: PropTypes.array,
  searchResult: PropTypes.array,
  handleUnitClicked: PropTypes.func,
  handleAddCaseClicked: PropTypes.func,
  administrate: PropTypes.bool,
  showAddBtn: PropTypes.bool
}
