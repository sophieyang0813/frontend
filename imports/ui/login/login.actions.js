import { Meteor } from 'meteor/meteor'
import { push } from 'react-router-redux'

export function submitCredentials (email, password) {
  return (dispatch) => {
    Meteor.loginWithPassword(email, password, (err) => {
      // TODO: Handle error in UI
      if (err) return console.error('Login error')
      dispatch(push('/unit/new'))
    })
  }
}