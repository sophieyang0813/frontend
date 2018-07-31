import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AutoComplete from 'material-ui/AutoComplete'

export default class EditableAutocomplete extends Component {
  constructor (props) {
    super(props)
    this.state = {
      value: props.initialValue || '',
      searchText: props.searchText,
      countryValid: props.countryValid
    }
    this.lastEditTime = 0
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.initialValue !== this.props.initialValue && Date.now() - this.lastEditTime > 2000) {
      this.setState({value: nextProps.initialValue})
    }
  }
  handleEdit = (value) => {
    this.setState({value})
    this.lastEditTime = Date.now()
    this.props.onEdit(value)
  }
  render () {
    const { label, dataList, handleNewRequest, handleUpdateInput } = this.props
    // const { value } = this.state

    return (
      <AutoComplete
        floatingLabelText={label}
        fullWidth
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        targetOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        filter={AutoComplete.caseInsensitiveFilter}
        maxSearchResults={4}
        onNewRequest={handleNewRequest()}
        dataSource={dataList}
        onUpdateInput={handleUpdateInput()}
        searchText={this.state.searchText}
        errorText={this.state.countryValid}
        onChange={({ target: { value } }) => this.handleEdit(value)}
      />
    )
  }
}
EditableAutocomplete.propTypes = {
  label: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired
  // isMultiLine: PropTypes.bool,
  // initialValue: PropTypes.string,
  // selectionList: PropTypes.array
}
