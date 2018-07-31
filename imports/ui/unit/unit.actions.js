/// create action edit_unit_field
/// indicates that in server side that things are being edited 
/// send this function as a prop in editable item
export const EDIT_UNIT_FIELD = 'edit_unit_field'

export function editUnitField (changeSet, unitId) {
  return {
    type: EDIT_UNIT_FIELD,
    changeSet,
    unitId
  }
}
