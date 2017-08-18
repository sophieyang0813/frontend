import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import ReactDOM from 'react-dom'
import { createContainer } from 'meteor/react-meteor-data'
import { submitCredentials } from './login.actions'
import PropTypes from 'prop-types'

class LoginPage extends Component {
  constructor () {
    super(...arguments)
    this.state = {
      showPass: false
    }
  }
  toggleShowPass () {
    this.setState({
      showPass: !this.state.showPass
    })
  }
  handleSubmit (event) {
    event.preventDefault()
    const email = ReactDOM.findDOMNode(this.refs.emailInput).value.trim()
    const pass = ReactDOM.findDOMNode(this.refs.passInput).value.trim()
    this.props.dispatch(submitCredentials(email, pass))
  }
  render () {
    const textInputClassStr = 'pa2 input-reset ba bg-transparent w-100'
    const inputLabelClassStr = 'db fw6 lh-copy f6'
    return (
      <div className='w-100'>
        <main className='pa4 black-80'>
          <h2 className='f3 fw6 ph0 mh0 tc'>Unee-T</h2>
          <h3 className='f4 fw3 ph0 mh0 tc'>Login with</h3>
          <div className='measure center tc'>
            {this.renderSocialSignupLink('facebook')}
            {this.renderSocialSignupLink('google-plus')}
            {this.renderSocialSignupLink('linked-in')}
          </div>
          <h3 className='f4 fw6 ph0 mh0 tc'>Or</h3>
          <form className='measure center' onSubmit={this.handleSubmit.bind(this)}>
            <fieldset id='sign_up' className='ba b--transparent ph0 mh0'>
              <div className='mt3'>
                <label className={inputLabelClassStr} htmlFor='email-address'>Email</label>
                <input className={textInputClassStr} ref='emailInput' type='email' name='email-address' />
              </div>
              <div className='mv3'>
                <label className={inputLabelClassStr} htmlFor='password'>Password</label>
                <input className={textInputClassStr + ' b'} ref='passInput' type={this.state.showPass ? 'text' : 'password'} name='password' />
              </div>
              <label className='pa0 ma0 lh-copy f6 pointer'>
                <input type='checkbox' checked={this.state.showPass} onChange={this.toggleShowPass.bind(this)} /> Show password
              </label>
            </fieldset>
            { this.props.showLoginError
              ? (
                <div className='tc pv1'>
                  <small>Email or password do not match</small>
                </div>
              ) : null}
            <div className='tc'>
              <input className='b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib' type='submit' value='Login' />
            </div>
            <div className='lh-copy mt3'>
              <Link className='f6 link dim black db' to='/signup'>Sign up</Link>
              <a href='#0' className='f6 link dim black db'>Forgot your password?</a>
            </div>
          </form>
        </main>
      </div>
    )
  }
  renderSocialSignupLink (type) {
    return (
      <a href='#1' className='link dim mr3'>
        <svg viewBox='0 0 16 16' className='dib h2 w2'>
          <use xlinkHref={`icons.svg#${type}`} />
        </svg>
      </a>
    )
  }
}

LoginPage.propTypes = {
  showLoginError: PropTypes.string
}

export default connect(
  ({showLoginError}) => ({showLoginError}) // map redux state to props
)(createContainer(() => ({}), LoginPage)) // map meteor state to props
