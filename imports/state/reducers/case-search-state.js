import {
  UPDATE_SEARCH_RESULT,
  SEARCH_ERROR,
  FINISH_SEARCH,
  START_SEARCH
} from '../../ui/case/case-search.actions'

const initialState = { searchText: null, searchFinished: null }
export default function caseSearchState (state = initialState, action) {
  switch (action.type) {
    case SEARCH_ERROR:
      return action.value.error.message || action.value.message
    case UPDATE_SEARCH_RESULT:
      return Object.assign({}, state, { searchText: action.searchText })
    case FINISH_SEARCH:
      return Object.assign({}, state, { searchFinished: true })
    case START_SEARCH:
      return Object.assign({}, state, { searchFinished: false })
  }
  return state
}
