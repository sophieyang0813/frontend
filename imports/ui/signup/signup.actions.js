// import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import routerRedux from 'react-router-redux'
export const SIGNUP_ERROR = 'signup_error'
export const SIGNUP_IN_PROGRESS = 'signup_in_progress'

export function submitSignupInfo (info) {
  const { push } = routerRedux
  return (dispatch) => {
    dispatch({
      type: SIGNUP_IN_PROGRESS
    })
    Accounts.createUser({
      email: info.emailAddress,
      password: info.password,
      profile: {
      }
    }, (err) => {
      if (err) {
        dispatch({
          type: SIGNUP_ERROR,
          value: err
        })
      } else {
        dispatch(push('/unit'))
      }
    })
  }
}
