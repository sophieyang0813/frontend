// @flow
// import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import routerRedux from 'react-router-redux'
export const SIGNUP_ERROR = 'signup_error'
export const SIGNUP_IN_PROGRESS = 'signup_in_progress'

type Action =
  | { type: typeof SIGNUP_ERROR }
  | { type: typeof SIGNUP_IN_PROGRESS, value: {} };

 type Info = {
    password: string,
    emailAddress: string
  }

type Dispatch = (action: Action) => any;
type ThunkAction = (dispatch: Dispatch) => any

export default function submitSignupInfo (info: Info): ThunkAction {
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
