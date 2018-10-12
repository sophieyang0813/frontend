export const SORT_BY = {
  DATE_DESCENDING: 0,
  DATE_ASCENDING: 1,
  NAME_ASCENDING: 2,
  NAME_DESCENDING: 3,
  LATEST_UPDATE: 4,
  OLDEST_UPDATE: 5
}

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
    const nameA = a.title || a.name || a.unitTitle
    const nameB = b.title || b.name || b.unitTitle
    return nameA.localeCompare(nameB)
  },
  [SORT_BY.NAME_DESCENDING]: (a, b) => {
    const nameA = a.title || a.name || a.unitTitle
    const nameB = b.title || b.name || b.unitTitle
    return nameB.localeCompare(nameA)
  },
  [SORT_BY.LATEST_UPDATE]: (a, b) => {
    const latestUpdateA = (a.items && a.items[0].latestUpdate !== 0) ? a.items[0].latestUpdate : 0
    const latestUpdateB = (b.items && b.items[0].latestUpdate !== 0) ? b.items[0].latestUpdate : 0
    return latestUpdateB - latestUpdateA
  },
  [SORT_BY.OLDEST_UPDATE]: (a, b) => {
    const oldestUpdateA = (a.items && a.items[0].latestUpdate !== 0) ? a.items[0].latestUpdate : 0
    const oldestUpdateB = (b.items && b.items[0].latestUpdate !== 0) ? b.items[0].latestUpdate : 0
    return oldestUpdateA - oldestUpdateB
  }
}
