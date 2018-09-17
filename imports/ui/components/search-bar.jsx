import React, { Component } from 'react'
import TextField from 'material-ui/TextField'
import {
  textInputFloatingLabelStyle,
  textInputUnderlineFocusStyle,
  whiteInput
} from '../components/form-controls.mui-styles'

export default class SearchBar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchText: ''
    }
  }

  handleSearch = (evt) => {
    this.setState({searchText: evt.target.value})
    this.props.findUnit(evt.target.value)
  }

  render () {
    const { searchText } = this.state
    return (
      <TextField
        hintText='Search units'
        floatingLabelShrinkStyle={textInputFloatingLabelStyle}
        underlineFocusStyle={textInputUnderlineFocusStyle}
        inputStyle={whiteInput}
        hintStyle={whiteInput}
        fullWidth
        value={searchText}
        onChange={(evt) => this.handleSearch(evt)}
      />
    )
  }
}
