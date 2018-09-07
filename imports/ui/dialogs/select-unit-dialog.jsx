import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createContainer } from 'meteor/react-meteor-data'
import PropTypes from 'prop-types'
import Dialog from 'material-ui/Dialog'
import RaisedButton from 'material-ui/RaisedButton'
import CircularProgress from 'material-ui/CircularProgress'
import FontIcon from 'material-ui/FontIcon'
// import ErrorDialog from '../dialogs/error-dialog'
import { modalTitleStyle, closeDialogButtonStyle } from './generic-dialog.mui-styles'
import UnitTypeIcon from '../unit-explorer/unit-type-icon'

class SelectUnitDialog extends Component {
  // } 0) when clicked +, url changes to /select-unit/ 
  // 1) receive a list of units 
  // 2) these units are clickable 
  // 3) create report leads to /unit/:id/report/new

  render () {
    const { show, onDismissed, inProgress, units } = this.props
    return (
      <Dialog
        title='Select your unit'
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
        <div className='overflow-hidden'> 
          <div className='overflow-auto'>
            {units.map(({ name, metaData }) =>
              <div key={name}>
                <div className='flex items-center h3 bt b--light-gray bg-white'
                  // onClick={evt => this.handleExpandUnit(evt, name)}
                > 
                  <UnitTypeIcon metaData={metaData} />
                  <div className='flex-grow ellipsis mid-gray mr4'>
                    {name}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* <ErrorDialog show={!!error} text={error} onDismissed={() => {
          dispatch(clearReportCreateError())
          onDismissed()
        }} /> */}
      </Dialog>
    )
  }
}

SelectUnitDialog.propTypes = {
  // show: PropTypes.bool.isRequired,
  // onDismissed: PropTypes.func.isRequired,
  // unitName: PropTypes.string.isRequired,
  // inProgress: PropTypes.bool.isRequired,
  // error: PropTypes.string
}

export default connect(({ reportCreationState }) => ({
  inProgress: !!reportCreationState.inProgress,
  error: reportCreationState.error || ''
}))(createContainer(() => ({}), SelectUnitDialog))
