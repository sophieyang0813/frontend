import React, { Component } from 'react'
import PropTypes from 'prop-types'

import AppBar from 'material-ui/AppBar'
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import { UneeTIcon } from '../components/unee-t-icons'
import TextField from 'material-ui/TextField'
import MenuItem from 'material-ui/MenuItem'

import {
  textInputStyle,
  textInputFloatingLabelStyle,
  textInputUnderlineFocusStyle,
  selectInputIconStyle
} from '../components/form-controls.mui-styles'

import {
  titleStyle,
  logoIconStyle,
  logoButtonStyle
} from '../components/app-bar.mui-styles'

// searchbar 1) when clicked, search text appear
//2) when type, items are sorted (filtered)
// 3) display item

class SearchBar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchText: ''
    }
  }

  handleSearch = (evt) => {
    console.log('value', evt.target.value)
    this.setState({searchText: evt.target.value})
  }

  render () {
    const { searchText } = this.state
    return (
      <TextField
        hintText='Search'
        floatingLabelShrinkStyle={textInputFloatingLabelStyle}
        underlineFocusStyle={textInputUnderlineFocusStyle}
        inputStyle={textInputStyle}
        fullWidth
        value={searchText}
        onChange={(evt) => this.handleSearch(evt)}
        // onChange={(evt) => this.setState({searchText: evt.target.value})}
      />
    )
  }
}

class RootAppBar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchEnabled: false
    }
  }
  render () {
    const { title, onIconClick, shadowless } = this.props
    const { searchEnabled } = this.state
    return (
      <AppBar title={searchEnabled ? <SearchBar /> : title} id={title} titleStyle={titleStyle} style={shadowless ? {boxShadow: 'none'} : undefined}
        iconElementLeft={
          searchEnabled ? (
            // <div style={{position: 'relative'}}>
            <IconButton>
              <FontIcon className='material-icons' color='white'>arrow_back</FontIcon>
            </IconButton>
            //  <SearchBar style={{position: 'absolute', marginLeft: '0'}}/>
            // </div>
          ) : (
            <IconButton iconStyle={logoIconStyle} style={logoButtonStyle} onClick={onIconClick}>
              <UneeTIcon />
            </IconButton>
          )
        }
        iconElementRight={
          <div>
            <IconButton>
              <FontIcon className='material-icons' color='white' onClick={() => this.setState({searchEnabled: true})}>search</FontIcon>
            </IconButton>
            <IconButton>
              <FontIcon className='material-icons' color='white'>notifications</FontIcon>
            </IconButton>
          </div>
        }
      />)
  }
}

// const RootAppBar = ({ title, onIconClick, shadowless }) => (
//   <AppBar title={title} titleStyle={titleStyle} style={shadowless ? {boxShadow: 'none'} : undefined}
//     iconElementLeft={
//       <IconButton iconStyle={logoIconStyle} style={logoButtonStyle} onClick={onIconClick}>
//         <UneeTIcon />
//       </IconButton>
//     }
//     iconElementRight={
//       <div>
//         <IconButton>
//           <FontIcon className='material-icons' color='white'>search</FontIcon>
//         </IconButton>
//         <IconButton>
//           <FontIcon className='material-icons' color='white'>notifications</FontIcon>
//         </IconButton>
//       </div>
//     }
//   />
// )
RootAppBar.propTypes = {
  title: PropTypes.string.isRequired,
  onIconClick: PropTypes.func
}

export default RootAppBar

