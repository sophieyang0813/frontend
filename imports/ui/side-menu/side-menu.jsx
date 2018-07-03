import React, { Component } from 'react'
import { Meteor } from 'meteor/meteor'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { createContainer } from 'meteor/react-meteor-data'
import { Link, Route, withRouter } from 'react-router-dom'
import Drawer from 'material-ui/Drawer'
import { logoutUser, setDrawerState } from '../general-actions'
import MenuItem from 'material-ui/MenuItem'
import FontIcon from 'material-ui/FontIcon'
import Divider from 'material-ui/Divider'
import { renderAppBarLeft, renderCurrUserAvatar } from '../util/app-bar-utils'

class SideMenu extends Component {
  linkDrawerItem = ({href, iconName, text, isExternal}, doHighlight = false) => {
    const { dispatch } = this.props
    return (
      <Link className='link' to={href} target={isExternal ? '_blank' : null}>
        <div className={doHighlight ? 'bg-very-light-gray' : ''}>
          <MenuItem onClick={isExternal ? undefined : () => dispatch(setDrawerState(false))}>
            <div className='flex items-center pv2 mv1'>
              <div className='w1-5 lh-title tc'>
                <FontIcon className='material-icons' color='var(--mid-gray)'>{iconName}</FontIcon>
              </div>
              <div className='ml4 mid-gray'>{text}</div>
            </div>
          </MenuItem>
        </div>
      </Link>
    )
  }

  routeDrawerItem = (path, options) => (
    <Route path={path} children={({ match }) =>
      this.linkDrawerItem(options, !!match)
    } />
  )

  render () {
    const { user, isDrawerOpen, dispatch } = this.props
    return user ? (
      <Drawer
        docked={false}
        width={300}
        open={isDrawerOpen}
        onRequestChange={(open) => dispatch(setDrawerState(open))}
      >
        <div className='bg-bondi-blue pa3'>
          {renderAppBarLeft(() => dispatch(setDrawerState(true)))}
          <div className='flex items-center mt4'>
            {renderCurrUserAvatar(user, true)}
            <div className='ml3 white ellipsis'>
              {user.profile && (user.profile.name || user.emails[0].address)}
            </div>
          </div>
        </div>
        {this.routeDrawerItem('/unit', {
          href: '/unit',
          iconName: 'location_on',
          text: 'Units'
        })}
        {this.routeDrawerItem('/case', {
          href: '/case',
          iconName: 'card_travel',
          text: 'Cases'
        })}
        <Divider />
        {this.linkDrawerItem({
          href: 'https://unee-t.com/contact-support/',
          iconName: 'live_help',
          text: 'Support',
          isExternal: true
        })}
        {this.linkDrawerItem({
          href: 'https://forum.unee-t.com/',
          iconName: 'forum',
          text: 'Forum',
          isExternal: true
        })}
        {this.linkDrawerItem({
          href: 'https://documentation.unee-t.com',
          iconName: 'help',
          text: 'FAQ',
          isExternal: true
        })}
        <Divider />
        {this.routeDrawerItem('/notification-settings', {
          href: '/notification-settings',
          iconName: 'settings_applications',
          text: 'Notification Settings'
        })}
        <MenuItem onClick={() => dispatch(logoutUser())}>
          <div className='flex items-center pv2 mv1'>
            <div className='w1-5 lh-title tc'>
              <FontIcon className='icon-logout' color='var(--mid-gray)' />
            </div>
            <div className='ml4 mid-gray'>Logout</div>
          </div>
        </MenuItem>
      </Drawer>
    ) : null
  }
}

SideMenu.propTypes = {
  user: PropTypes.object,
  isDrawerOpen: PropTypes.bool
}

export default withRouter(connect(
  ({ drawerState }) => ({isDrawerOpen: drawerState.isOpen}) // map redux state to props
)(createContainer(() => ({ // map meteor state to props
  user: Meteor.user()
}), SideMenu)))
