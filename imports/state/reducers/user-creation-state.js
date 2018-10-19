import { SIGNUP_ERROR, SIGNUP_IN_PROGRESS } from '../../ui/signup/signup.actions'

const idleState = {inProgress: false, error: null}
export default function userCreationState (state = idleState, action) {
  switch (action.type) {
    case SIGNUP_IN_PROGRESS:
      return Object.assign({}, state, {inProgress: true})
    case SIGNUP_ERROR:
      return Object.assign({}, state, {error: action.value.error.message || action.value.message})
    default:
      return state
  }
}
