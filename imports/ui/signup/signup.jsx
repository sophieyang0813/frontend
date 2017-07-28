import React, { Component } from 'react'

class LoginPage extends Component {
  render() {
    return (
      <div className='w-100'>
        <main className='pa4 black-80'>
          <h2 className='f3 fw6 ph0 mh0 tc'>Unee-T</h2>
          <h3 className='f4 fw6 ph0 mh0 tc normal'>Login with</h3>
          <form className='measure center'>
            <fieldset id='sign_up' className='ba b--transparent ph0 mh0'>
              <div className='mt3'>
                <label className='db fw6 lh-copy f6' htmlFor='email-address'>Email</label>
                <input className='pa2 input-reset ba bg-transparent w-100' type='email' name='email-address'  id='email-address'/>
              </div>
              <div className='mv3'>
                <label className='db fw6 lh-copy f6' htmlFor='password'>Password</label>
                <input className='b pa2 input-reset ba bg-transparent w-100' type='password' name='password'  id='password'/>
              </div>
              <label className='pa0 ma0 lh-copy f6 pointer'><input type='checkbox'/> Remember me</label>
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
}

export default LoginPage