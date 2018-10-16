export const SORT_BY = {
  DATE_DESCENDING: 0,
  DATE_ASCENDING: 1,
  NAME_ASCENDING: 2,
  NAME_DESCENDING: 3,
  LATEST_UPDATE: 4,
  OLDEST_UPDATE: 5
}

export const labels = [
  [SORT_BY.DATE_DESCENDING, {category: 'Created - Latest', selected: 'Created ↓'}],
  [SORT_BY.DATE_ASCENDING, {category: 'Created - Oldest', selected: ' Created ↑'}],
  [SORT_BY.NAME_ASCENDING, {category: 'Name (A to Z)', selected: 'Name ↑'}],
  [SORT_BY.NAME_DESCENDING, {category: 'Name (Z to A)', selected: 'Name ↓'}]
]

export const sorters = {
  [SORT_BY.DATE_DESCENDING]: (a, b) => {
    const latestCaseAunit = a.items && a.items[0].creation_time
    const latestCaseBunit = b.items && b.items[0].creation_time
    const dateA = Date.parse((latestCaseAunit && latestCaseAunit) || a.creation_time)
    const dateB = Date.parse((latestCaseBunit && latestCaseBunit) || b.creation_time)
    return dateB - dateA
  },
  [SORT_BY.DATE_ASCENDING]: (a, b) => {
    const oldestCaseAunit = a.items && a.items[a.items.length - 1].creation_time
    const oldestCaseBunit = b.items && b.items[b.items.length - 1].creation_time
    const dateA = Date.parse((oldestCaseAunit && oldestCaseAunit) || a.creation_time)
    const dateB = Date.parse((oldestCaseBunit && oldestCaseBunit) || b.creation_time)
    return dateA - dateB
  },
  [SORT_BY.NAME_ASCENDING]: (a, b) => {
    const nameA = a.unitTitle || a.title
    const nameB = b.unitTitle || b.title
    return nameA.localeCompare(nameB)
  },
  [SORT_BY.NAME_DESCENDING]: (a, b) => {
    const nameA = a.unitTitle || a.title
    const nameB = b.unitTitle || b.title
    return nameB.localeCompare(nameA)
  },
  [SORT_BY.LATEST_UPDATE]: (a, b) => {
    const latestUpdateA = (a.items && a.items[0].latestUpdate) || a.latestUpdate
    const latestUpdateB = (b.items && b.items[0].latestUpdate) || b.latestUpdate
    return latestUpdateB - latestUpdateA
  },
  [SORT_BY.OLDEST_UPDATE]: (a, b) => {
    const oldestUpdateA = (a.items && a.items[a.items.length - 1].latestUpdate) || a.latestUpdate
    const oldestUpdateB = (b.items && b.items[b.items.length - 1].latestUpdate) || b.latestUpdate
    return oldestUpdateA - oldestUpdateB
  }
}
