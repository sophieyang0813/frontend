import React, { Component } from 'react'

class LoginPage extends Component {
  render() {
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
          <form className='measure center'>
            <fieldset id='sign_up' className='ba b--transparent ph0 mh0'>
              <div className='mt3'>
                <label className={inputLabelClassStr} htmlFor='email-address'>Email</label>
                <input className={textInputClassStr} type='email' name='email-address'  id='email-address' />
              </div>
              <div className='mv3'>
                <label className={inputLabelClassStr} htmlFor='password'>Password</label>
                <input className={textInputClassStr + ' b'} type='password' name='password'  id='password' />
              </div>
              <label className='pa0 ma0 lh-copy f6 pointer'><input type='checkbox' /> Remember me</label>
            </fieldset>
            <div className='tc'>
              <input className='b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib' type='submit' value='Login' />
            </div>
            <div className='lh-copy mt3'>
              <a href='#0' className='f6 link dim black db'>Sign up</a>
              <a href='#0' className='f6 link dim black db'>Forgot your password?</a>
            </div>
          </form>
        </main>
      </div>
    )
  }
  renderSocialSignupLink(type) {
    return (
      <a href='#1' className='link dim mr3'>
        <svg viewBox='0 0 16 16' className='dib h2 w2'>
          <use xlinkHref={`icons.svg#${type}`} />
        </svg>
      </a>
    )
  }
}

export default LoginPage