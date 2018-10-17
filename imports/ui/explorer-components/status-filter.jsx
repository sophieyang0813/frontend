import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  selectInputIconStyle,
  noUnderline,
  sortBoxInputStyle,
  selectedItemStyle
} from '../components/form-controls.mui-styles'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'

export class StatusFilter extends Component {
  handleStatusFilterClicked = (event, index, values) => {
    this.props.onFilterClicked(event, index, values)
  }

  filterMenu (filterValues, menuItem) {
    return menuItem.map((name, index) => (
      <MenuItem
        key={name}
        value={name}
        primaryText={name}
        label={name}
      />
    ))
  }

  render () {
    const { statusFilterValues, status } = this.props
    return (
      <SelectField
        hintText='Status'
        value={statusFilterValues}
        onChange={this.handleStatusFilterClicked}
        autoWidth
        underlineStyle={noUnderline}
        hintStyle={sortBoxInputStyle}
        iconStyle={selectInputIconStyle}
        labelStyle={sortBoxInputStyle}
        selectedMenuItemStyle={selectedItemStyle}
      >
        {this.filterMenu(statusFilterValues, status)}
      </SelectField>
    )
  }
}

StatusFilter.propTypes = {
  sortBy: PropTypes.number,
  statusFilterValues: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ])
}
