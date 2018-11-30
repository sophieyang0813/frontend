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
import { renderCurrUserAvatar } from '../util/app-bar-utils'

class RootAppBar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchTextDisplay: false
    }
    this.handleSearch = this.handleSearch.bind(this)
  }

  handleSearch (evt) {
    this.props.onSearchChanged(evt.target.value)
  }

  render () {
    const { title, placeholder, onIconClick, shadowless, searchText, showSearch, user, cases } = this.props
    const { searchTextDisplay } = this.state
    return (
      <AppBar
        title={searchTextDisplay
          ? (
            <TextField
              hintText={placeholder}
              floatingLabelShrinkStyle={textInputFloatingLabelStyle}
              underlineFocusStyle={textInputUnderlineFocusStyle}
              inputStyle={whiteInput}
              hintStyle={whiteInput}
              fullWidth
              value={searchText}
              onChange={this.handleSearch}
            />
          )
          : (title)
        }
        id={title}
        titleStyle={titleStyle}
        style={shadowless ? { boxShadow: 'none' } : undefined}
        iconElementLeft={
          searchTextDisplay ? (
            <IconButton
              onClick={() => this.setState({ searchTextDisplay: false })}
            >
              <FontIcon className='material-icons' color='white'>
               arrow_back</FontIcon>
            </IconButton>
          ) : (
            <IconButton iconStyle={logoIconStyle} style={logoButtonStyle} onClick={onIconClick}>
              <UneeTIcon />
            </IconButton>
          )
        }
        iconElementRight={
          <div className={cases && 'flex items-center'}>
            <span className={((!showSearch || searchTextDisplay) ? 'dn' : '')}>
              <IconButton onClick={() => this.setState({ searchTextDisplay: true })}>
                <FontIcon className='material-icons' color='white'>
                  search
                </FontIcon>
              </IconButton>
            </span>
            <IconButton>
              <FontIcon className='material-icons' color='white'>notifications</FontIcon>
            </IconButton>
            {cases &&
            <div className={'flex items-center'}>
              <div className='white'>Welcome, {user.profile && user.profile.name}</div>
              <div className='ml2'>
                {renderCurrUserAvatar(user)}
              </div>
            </div>
            }
          </div>
        }
      />)
  }
}

RootAppBar.propTypes = {
  showSearch: PropTypes.bool,
  title: PropTypes.string.isRequired,
  onIconClick: PropTypes.func,
  onSearchChanged: PropTypes.func,
  searchText: PropTypes.string
}

export default RootAppBar
