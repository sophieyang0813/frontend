import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createContainer } from 'meteor/react-meteor-data'
import PropTypes from 'prop-types'
import Dialog from 'material-ui/Dialog'
import { push } from 'react-router-redux'
import FontIcon from 'material-ui/FontIcon'
import { modalTitleStyle, closeDialogButtonStyle } from './generic-dialog.mui-styles'
import UnitTypeIcon from '../unit-explorer/unit-type-icon'

class SelectUnitDialog extends Component {

  render () {
    const { show, onDismissed, inProgress, units, dispatch } = this.props
    return (
      <Dialog
        title='Select the unit'
        titleStyle={modalTitleStyle}
        open={show}
      >
        {!inProgress && (
          <button onClick={onDismissed}
            className='button b--none bg-transparent absolute top-1 pt2 right-1 outline-0'
          >
            <FontIcon className='material-icons' style={closeDialogButtonStyle}>close</FontIcon>
          </button>
        )}
        <div className='overflow-scroll ba b--moon-gray mt2 pa2 tc br1 mr3 ml3'>
          {units.map(({ name, metaData, id }) =>
            <div key={id} onClick={() => dispatch(push(`/unit/${id}/reports/new`))}>
              <div className='flex h3 bt b--light-gray bg-white'>
                <UnitTypeIcon iconInReport={metaData && metaData.unitType} />
                <div className='flex-grow mid-gray '>
                  {name}
                </div>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    )
  }
}

SelectUnitDialog.propTypes = {
  show: PropTypes.bool.isRequired,
  onDismissed: PropTypes.func.isRequired
}

export default connect(({ reportCreationState }) => ({
  inProgress: !!reportCreationState.inProgress,
  error: reportCreationState.error || ''
}))(createContainer(() => ({}), SelectUnitDialog))
