import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import hideCompleted from './reducers/hide-completed'

const rootReducer = combineReducers({
  hideCompleted,
  router
})

export default rootReducer
