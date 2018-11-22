export const UPDATE_SEARCH_RESULT = 'update_search_result'

export function updateSearch (searchText, searchResult) {
  return {
    type: UPDATE_SEARCH_RESULT,
    searchText: searchText,
    searchResult: searchResult
  }
}
