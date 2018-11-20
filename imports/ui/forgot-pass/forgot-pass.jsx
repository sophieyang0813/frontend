import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import RaisedButton from 'material-ui/RaisedButton'
import { connect } from 'react-redux'
import { createContainer } from 'meteor/react-meteor-data'
import PropTypes from 'prop-types'
import CircularProgress from 'material-ui/CircularProgress'

import LoginLayout from '../layouts/login-layout'
import InputRow from '../components/input-row'
import { emailValidator } from '../../util/validators'
import { forgotPass, resetError } from './forgot-pass.actions'

class ForgotPass extends Component {
  constructor () {
    super(...arguments)
    this.state = {
      email: ''
    }
  }
  componentDidMount () {
    this.setState({
      email: new URL(window.location).searchParams.get('email') || ''
    })
  }
  handleSubmit = evt => {
    evt.preventDefault()
    const { email, error } = this.state
    if (!email || !!error) return

    this.props.dispatch(forgotPass(email))
  }
  handleEmailChange = evt => {
    const { asyncError, dispatch } = this.props
    this.setState({
      email: evt.target.value,
      error: emailValidator(evt.target.value) ? null : 'Email address is invalid'
    })
    if (asyncError) {
      dispatch(resetError())
    }
  }
  render () {
    const { email, error } = this.state
    const { asyncError, isProcessing } = this.props
    return (
      <LoginLayout subHeading='Forgot password?' footerContent={
        <div>
          Don't have an account?&nbsp;
          <Link className='link dim b white' to='/signup'>Sign up for one here</Link>
          <br />
          It's FREE!
        </div>
      }>
        <div className='relative'>
          <form onSubmit={this.handleSubmit} className={isProcessing ? 'o-0 disabled' : ''}>
            <div className='f6 mid-gray lh-title tc'>
              Enter the email address associated with your account, and we’ll email you a link to reset your password.
            </div>
            <fieldset className='ba b--transparent ph0 mh0'>
              <InputRow label='Email address' value={email} inpType='email' errorText={error || asyncError}
                onChange={this.handleEmailChange} />
            </fieldset>
            <div className='flex mt3 items-center'>
              <div className='flex-grow lh-copy tl'>
                <Link to='/' className='f6 link dim bondi-blue'>Back to login</Link>
              </div>
              <RaisedButton label='Send reset link' labelColor='white' backgroundColor='var(--bondi-blue)' type='submit'
                disabled={!email || !!error}
              />
            </div>
          </form>
          {isProcessing && (
            <div className='absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center'>
              <CircularProgress size={70} />
            </div>
          )}
        </div>
      </LoginLayout>
    )
  }
}

ForgotPass.propType = {
  asyncError: PropTypes.string,
  isProcessing: PropTypes.bool
}

export default connect(
  ({ sendResetLinkState }) => ({
    asyncError: sendResetLinkState.error,
    isProcessing: sendResetLinkState.processing
  }) // map redux state to props
)(createContainer(() => ({ // map meteor state to props
}), ForgotPass))
