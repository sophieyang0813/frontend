import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class SignupPage extends Component {
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
  render () {
    return (
      <div className='w-100'>
        <main className='pa4 black-80'>
          <h2 className='f3 fw6 ph0 mh0 tc'>Unee-T</h2>
          <h3 className='f4 fw3 ph0 mh0 tc'>Sign up</h3>
          <form className='measure center'>
            <fieldset id='sign_up' className='ba b--transparent ph0 mh0'>
              <div className='mt3'>
                <label className='db fw6 lh-copy f6' htmlFor='name-input'>Name</label>
                <input className='b pa2 input-reset ba bg-transparent w-100' type='text' name='name-input' id='name-input' placeholder='Your name' />
              </div>
              <div className='mv3'>
                <label className='db fw6 lh-copy f6' htmlFor='phone-number'>Phone</label>
                <input className='b pa2 input-reset ba bg-transparent w-100' type='text' name='phone-number' id='phone-number' placeholder='Your phone number' />
              </div>
              <div className='mv3'>
                <label className='db fw6 lh-copy f6' htmlFor='country-input'>Country</label>
                <input className='b pa2 input-reset ba bg-transparent w-100' type='text' name='country-input' id='country-input' placeholder='Country of residence' />
              </div>
              <div className='mv3'>
                <label className='db fw6 lh-copy f6' htmlFor='email-address'>Email</label>
                <input className='b pa2 input-reset ba bg-transparent w-100' type='text' name='email-address' id='email-address' placeholder='Your email address' />
              </div>
              <div className='mv3'>
                <label className='db fw6 lh-copy f6' htmlFor='password'>Password</label>
                <input className='pa2 input-reset ba bg-transparent w-100 b' type={this.state.showPass ? 'text' : 'password'} name='password' />
              </div>
              <label className='pa0 ma0 lh-copy f6 pointer'>
                <input type='checkbox' checked={this.state.showPass} onChange={this.toggleShowPass.bind(this)} /> Show password
              </label>
            </fieldset>
            <div className='tc'>
              <input className='b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib' type='submit' value='Submit' />
            </div>
            <div className='lh-copy mt3'>
              <Link className='f6 link dim black db' to='/'>Already registered? Log in!</Link>
            </div>
          </form>
        </main>
      </div>
    )
  }
}

export default SignupPage
