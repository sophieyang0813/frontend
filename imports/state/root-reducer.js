import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import hideCompleted from './reducers/hide-completed'
import showLoginError from './reducers/show-login-error'
import caseAttachmentUploads from './reducers/case-attachment-uploads'
import invitationState from './reducers/invitation-state'
import caseCreationState from './reducers/case-creation-state'
import reportCreationState from './reducers/report-creation-state'
import invitationLoginState from './reducers/invitation-login-state'
import sendResetLinkState from './reducers/send-reset-link-state'
import passResetState from './reducers/pass-reset-state'
import caseUsersState from './reducers/case-users-state'
import drawerState from './reducers/drawer-state'
import pathBreadcrumb from './reducers/path-breadcrumb'
import unitCreationState from './reducers/unit-creation-state'

const rootReducer = combineReducers({
  hideCompleted,
  showLoginError,
  caseAttachmentUploads,
  invitationState,
  caseCreationState,
  invitationLoginState,
  sendResetLinkState,
  passResetState,
  caseUsersState,
  drawerState,
  pathBreadcrumb,
  unitCreationState,
  reportCreationState,
  router
})

export default rootReducer
