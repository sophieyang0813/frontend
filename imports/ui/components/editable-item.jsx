import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TextField from 'material-ui/TextField'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

import {
  textInputStyle,
  textInputFloatingLabelStyle,
  textInputUnderlineFocusStyle,
  selectInputIconStyle
} from '../components/form-controls.mui-styles'

export default class EditableItem extends Component {
  constructor (props) {
    super(props)
    this.state = {
      value: props.initialValue || props.currentValue || ''
    }
    this.lastEditTime = 0
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.initialValue !== this.props.initialValue && Date.now() - this.lastEditTime > 2000) {
      this.setState({value: nextProps.initialValue})
    }
    if (nextProps.currentValue !== this.props.currentValue) {
      this.setState({value: nextProps.currentValue})
    }
  }
  handleEdit = (value) => {
    this.setState({value})
    this.lastEditTime = Date.now()
    this.props.onEdit(value)
  }
  render () {
    const { label, isMultiLine, selectionList, disabled, name, underlineShow, inpRef } = this.props
    const { value } = this.state

    if (!selectionList) {
      return (
        <TextField
          id={name}
          floatingLabelText={label}
          floatingLabelShrinkStyle={textInputFloatingLabelStyle}
          underlineFocusStyle={textInputUnderlineFocusStyle}
          inputStyle={textInputStyle}
          fullWidth
          disabled={!!disabled}
          multiLine={isMultiLine}
          underlineShow={typeof underlineShow === 'boolean' ? underlineShow : true}
          value={value}
          ref={inpRef}
          onChange={({ target: { value } }) => this.handleEdit(value)}
        />
      )
    } else {
      return (
        <SelectField
          floatingLabelText={label}
          fullWidth
          floatingLabelShrinkStyle={textInputFloatingLabelStyle}
          labelStyle={textInputStyle}
          disabled={!!disabled}
          menuStyle={textInputStyle}
          iconStyle={selectInputIconStyle}
          underlineFocusStyle={textInputUnderlineFocusStyle}
          value={value}
          onChange={(evt, idx, val) => this.handleEdit(val)}
        >
          {selectionList.map(item => (
            <MenuItem key={item} value={item} primaryText={item} />
          ))}
        </SelectField>
      )
    }
  }
}
EditableItem.propTypes = {
  label: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  isMultiLine: PropTypes.bool,
  initialValue: PropTypes.string,
  currentValue: PropTypes.string,
  selectionList: PropTypes.array,
  disabled: PropTypes.bool,
  inpRef: PropTypes.func, // relevant only if "selectionList" is undefined
  underlineShow: PropTypes.bool // relevant only if "selectionList" is undefined
}
