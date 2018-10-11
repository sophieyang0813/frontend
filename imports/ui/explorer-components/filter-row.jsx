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
import { SORT_BY } from '../explorer-components/sort-items'

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

  filterMenu (filterValues, menuItem, primaryText) {
    return menuItem.map((name, index) => (
      <MenuItem
        key={name}
        // insetChildren={this.props.report}
        // checked={this.props.report && (filterValues && filterValues.indexOf(name) > -1)}
        value={name}
        primaryText={(primaryText && primaryText[index]) || name}
        label={name}
      />
    ))
  }

  sortMenu (sortBy) {
    const labels = this.props.labels || [
      [SORT_BY.DATE_DESCENDING, 'Newest'],
      [SORT_BY.DATE_ASCENDING, 'Oldest'],
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

  render () {
    const { statusFilterValues, roleFilterValues, sortBy, roles, rolesPrimaryText, status } = this.props
    return (
      <div className='flex bg-very-light-gray'>
        <SelectField
          // multiple={this.props.report && true}
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
        <SelectField
          // multiple
          hintText='My role'
          value={roleFilterValues}
          onChange={this.handleRoleFilterClicked}
          autoWidth
          underlineStyle={noUnderline}
          hintStyle={sortBoxInputStyle}
          iconStyle={selectInputIconStyle}
          labelStyle={sortBoxInputStyle}
          selectedMenuItemStyle={selectedItemStyle}
        >
          {this.filterMenu(roleFilterValues, roles, rolesPrimaryText)}
        </SelectField>
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
