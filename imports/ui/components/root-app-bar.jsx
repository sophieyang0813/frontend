import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AppBar from 'material-ui/AppBar'
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import { UneeTIcon } from '../components/unee-t-icons'
import TextField from 'material-ui/TextField'
import {
  textInputFloatingLabelStyle,
  textInputUnderlineFocusStyle,
  whiteInput
} from '../components/form-controls.mui-styles'
import {
  titleStyle,
  logoIconStyle,
  logoButtonStyle
} from '../components/app-bar.mui-styles'

class SearchBar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchText: ''
    }
  }

  handleSearch = (evt) => {
    this.setState({searchText: evt.target.value})
    this.props.findItem(evt.target.value)
  }

  render () {
    const { searchText } = this.state
    const { style, hintText } = this.props
    return (
      <TextField
        hintText={hintText}
        floatingLabelShrinkStyle={textInputFloatingLabelStyle}
        underlineFocusStyle={textInputUnderlineFocusStyle}
        inputStyle={style}
        hintStyle={style}
        fullWidth
        value={searchText}
        onChange={(evt) => this.handleSearch(evt)}
      />
    )
  }
}

class RootAppBar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchTextDisplay: false
    }
  }

  render () {
    const { title, findItem, placeholder, onQueryChanged, shadowless } = this.props
    const { searchTextDisplay } = this.state

    return (
      <AppBar
        title={searchTextDisplay
          ? (<SearchBar findItem={findItem} hintText={placeholder} style={whiteInput} />)
          : (title)
        }
        id={title}
        titleStyle={titleStyle}
        style={shadowless ? {boxShadow: 'none'} : undefined}
        iconElementLeft={
          searchTextDisplay ? (
            <IconButton
              onClick={() => this.setState({searchTextDisplay: false})}
            >
              <FontIcon className='material-icons' color='white'>
               arrow_back</FontIcon>
            </IconButton>
          ) : (
            <IconButton iconStyle={logoIconStyle} style={logoButtonStyle} onClick={onQueryChanged}>
              <UneeTIcon />
            </IconButton>
          )
        }
        iconElementRight={
          <div>
            <span className={(searchTextDisplay ? 'dn' : '')}>
              <IconButton onClick={() => this.setState({searchTextDisplay: true})}>
                <FontIcon className='material-icons' color='white'>
                  search
                </FontIcon>
              </IconButton>
            </span>
            <IconButton>
              <FontIcon className='material-icons' color='white'>notifications</FontIcon>
            </IconButton>
          </div>
        }
      />)
  }
}

RootAppBar.propTypes = {
  showSearch: PropTypes.bool,
  title: PropTypes.string.isRequired,
  onQueryChanged: PropTypes.func,
  findItem: PropTypes.func
}

export default RootAppBar
