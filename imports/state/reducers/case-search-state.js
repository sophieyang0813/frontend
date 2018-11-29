import {
  UPDATE_SEARCH_RESULT,
  SEARCH_ERROR
} from '../../ui/case/case-search.actions'

const initialState = { searchResult: [] }
export default function caseSearchState (state = initialState, action) {
  switch (action.type) {
    case SEARCH_ERROR:
      return action.value.error.message || action.value.message
    case UPDATE_SEARCH_RESULT:
      return Object.assign({}, state, { searchResult: action.searchResult })
  }
  return state
}
