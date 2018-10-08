export const SORT_BY = {
  DATE_ASCENDING: 0,
  DATE_DESCENDING: 1,
  NAME_ASCENDING: 2,
  NAME_DESCENDING: 3
}

export const sorters = {
  [SORT_BY.DATE_ASCENDING]: (a, b) => {
    const dateA = Date.parse(a.creation_time)
    const dateB = Date.parse(b.creation_time)
    return dateB - dateA
  },
  [SORT_BY.DATE_DESCENDING]: (a, b) => {
    const dateA = Date.parse(a.creation_time)
    const dateB = Date.parse(b.creation_time)
    return dateA - dateB
  },
  [SORT_BY.NAME_ASCENDING]: (a, b) => {
    const nameA = a.title || a.name || a.unitTitle
    const nameB = b.title || b.name || b.unitTitle
    return nameA.localeCompare(nameB)
  },
  [SORT_BY.NAME_DESCENDING]: (a, b) => {
    const nameA = a.title || a.name || a.unitTitle
    const nameB = b.title || b.name || b.unitTitle
    return nameB.localeCompare(nameA)
  }
}
