export const UPDATE_SEARCH_RESULT = 'update_search_result'

export function updateSearch (searchResult) {
  return {
    type: UPDATE_SEARCH_RESULT,
    searchResult: searchResult
  }
}
