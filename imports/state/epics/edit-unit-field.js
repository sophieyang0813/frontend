import { Meteor } from 'meteor/meteor'
import { filter, debounceTime, distinctUntilChanged, tap, ignoreElements } from 'rxjs/operators'

import { EDIT_UNIT_FIELD } from '../../ui/unit/unit.actions'
import { collectionName } from '../../api/units'

export const editUnitField = action$ => action$
  .ofType(EDIT_UNIT_FIELD)
  .pipe(
    filter(() => !!Meteor.userId()),
    debounceTime(750),
    distinctUntilChanged(),
    tap(
      ({changeSet, unitId}) => Meteor.call(`${collectionName}.editUnitField`, parseInt(unitId), changeSet)
    ),
    ignoreElements()
  )
