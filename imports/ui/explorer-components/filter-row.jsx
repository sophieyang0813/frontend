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
    this.handleFilterClicked = this.handleFilterClicked.bind(this)
    this.handleSortClicked = this.handleSortClicked.bind(this)
  }

  handleFilterClicked (event, index, values) {
    this.props.onFilterClicked(event, index, values)
  }

  handleSortClicked (event, index, values) {
    this.props.onSortClicked(event, index, values)
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

  render () {
    const { statusFilterValues, sortBy } = this.props
    return (
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
    )
  }
}

FilterRow.propTypes = {
  sortBy: PropTypes.number,
  statusFilterValues: PropTypes.array
}
