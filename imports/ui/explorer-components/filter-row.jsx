import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  selectInputIconStyle,
  noUnderline,
  sortBoxInputStyle,
  selectedItemStyle,
  sortBoxBlueInputStyle
} from '../components/form-controls.mui-styles'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'
import { labels } from '../explorer-components/sort-items'

export class FilterRow extends Component {
  constructor (props) {
    super(props)
    this.handleStatusFilterClicked = this.handleStatusFilterClicked.bind(this)
    this.handleRoleFilterClicked = this.handleRoleFilterClicked.bind(this)
    this.handleSortClicked = this.handleSortClicked.bind(this)
  }

  handleStatusFilterClicked (event, index, values) {
    this.props.onFilterClicked(event, index, values)
  }

  handleRoleFilterClicked (event, index, values) {
    this.props.onRoleFilterClicked(event, index, values)
  }

  handleSortClicked (event, index, values) {
    this.props.onSortClicked(event, index, values)
  }

  filterMenu (filterValues, menuItem, label) {
    return menuItem.map((name, index) => (
      <MenuItem
        key={name}
        value={name}
        primaryText={name}
        label={label || name}
      />
    ))
  }

  roleFilterMenu (filterValues, menuItem) {
    return (
      <SelectField
        hintText='My role'
        value={filterValues}
        onChange={this.handleRoleFilterClicked}
        autoWidth
        underlineStyle={noUnderline}
        hintStyle={sortBoxInputStyle}
        iconStyle={selectInputIconStyle}
        labelStyle={filterValues === 'All' ? sortBoxInputStyle : sortBoxBlueInputStyle}
        selectedMenuItemStyle={selectedItemStyle}
      >
        {this.filterMenu(filterValues, menuItem, 'Role Filter')}
      </SelectField>
    )
  }

  sortMenu (sortBy) {
    const categories = this.props.labels ? this.props.labels : labels
    return categories.map(([sortBy, label], index) => (
      <MenuItem
        key={index}
        value={sortBy}
        primaryText={label.category}
        label={label.selected}
      />
    ))
  }

  render () {
    const { statusFilterValues, roleFilterValues, sortBy, roles, status } = this.props
    return (
      <div className='flex bg-very-light-gray'>
        { status &&
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
        }
        {this.roleFilterMenu(roleFilterValues, roles)}
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
    )
  }
}

FilterRow.propTypes = {
  sortBy: PropTypes.number,
  statusFilterValues: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ])
}
