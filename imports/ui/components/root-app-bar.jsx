import React, { Component } from 'react'
import PropTypes from 'prop-types'

import AppBar from 'material-ui/AppBar'
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import { UneeTIcon } from '../components/unee-t-icons'
import SearchBar from './search-bar'

import {
  titleStyle,
  logoIconStyle,
  logoButtonStyle
} from '../components/app-bar.mui-styles'

class RootAppBar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchTextDisplay: false
    }
  }
  render () {
    const { title, onIconClick, shadowless, findItem, searchOn, searchOff } = this.props
    const { searchTextDisplay } = this.state

    return (
      <AppBar
        title={searchTextDisplay ? <SearchBar findItem={findItem} /> : title}
        id={title}
        titleStyle={titleStyle}
        style={shadowless ? {boxShadow: 'none'} : undefined}
        iconElementLeft={
          searchTextDisplay ? (
            <IconButton
              onClick={() => { this.setState({searchTextDisplay: false}); searchOff() }}
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
          <div>
            <span className={(searchTextDisplay ? 'dn' : '')}>
              <IconButton onClick={() => searchOn && this.setState({searchTextDisplay: true})}>
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
  searchOn: PropTypes.bool,
  title: PropTypes.string.isRequired,
  onIconClick: PropTypes.func,
  findItem: PropTypes.func,
  searchOff: PropTypes.func
}

export default RootAppBar
