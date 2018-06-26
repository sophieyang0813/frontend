import React, { Component } from 'react'
import { Meteor } from 'meteor/meteor'
import { connect } from 'react-redux'
import { createContainer } from 'meteor/react-meteor-data'
import PropTypes from 'prop-types'
import { Link, withRouter } from 'react-router-dom'
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import RaisedButton from 'material-ui/RaisedButton'
import Cases, { openCases as filterOpenCases, closeCases as filterClosedCases, collectionName, isClosed } from '../../api/cases'
import { push } from 'react-router-redux'
import RootAppBar from '../components/root-app-bar'
import { storeBreadcrumb } from '../general-actions'

import {
  unitIconsStyle,
  moreIconColor
} from './case-explorer.mui-styles'

// const isClosed = caseItem => ['RESOLVED', 'VERIFIED', 'CLOSED'].includes(caseItem.status)

class CaseExplorer extends Component {
  constructor () {
    super(...arguments)
    this.state = {
      caseId: '',
      expandedUnits: [],
      unitsDict: {},
      unitsShowOpenDict: {},
      caseStatus: true
    }
  }

  handleOpenClicked (unitTitle) {
    const unitsShowOpenDict = Object.assign({}, this.state.unitsShowOpenDict)
    unitsShowOpenDict[unitTitle] = true
    this.setState({ unitsShowOpenDict })
  }

  handleClosedClicked (unitTitle) {
    const unitsShowOpenDict = Object.assign({}, this.state.unitsShowOpenDict)
    unitsShowOpenDict[unitTitle] = false
    this.setState({ unitsShowOpenDict })
  }

  handleExpandUnit (evt, unitTitle) {
    evt.preventDefault()
    this.setState({ caseStatus: true })
    const { expandedUnits } = this.state
    let stateMutation
    if (expandedUnits.includes(unitTitle)) {
      stateMutation = {
        expandedUnits: expandedUnits.filter(title => title !== unitTitle)
      }
    } else {
      stateMutation = {
        expandedUnits: expandedUnits.concat([unitTitle])
      }
    }
    this.setState(stateMutation)
  }
  componentWillReceiveProps ({isLoading, casesError, caseList}) {
    if (!isLoading && !casesError && isLoading !== this.props.isLoading) {
      this.props.dispatchLoadingResult({caseList})
    }
    if (!isLoading && (!this.props.caseList || this.props.caseList.length !== caseList.length)) {
      const unitsDict = caseList.sort((caseA, caseB) => {
        const aVal = isClosed(caseA) ? 1 : 0
        const bVal = isClosed(caseB) ? 1 : 0
        return aVal - bVal
      }).reduce((dict, caseItem) => {
        const { selectedUnit: unitTitle } = caseItem
        const unitCases = dict[unitTitle] = dict[unitTitle] || []
        unitCases.push(caseItem)
        return dict
      }, {})
      const unitsShowOpenDict = Object.assign({}, this.state.unitsShowOpenDict)
      Object.keys(unitsDict).forEach(unitTitle => {
        unitsShowOpenDict[unitTitle] = unitsShowOpenDict[unitTitle] || true
      })
      this.setState({
        unitsDict,
        unitsShowOpenDict
      })
    }
  }
  render () {
    const { isLoading, dispatch, match } = this.props
    const { unitsDict, unitsShowOpenDict } = this.state

    return (
      <div className='flex flex-column roboto overflow-hidden flex-grow h-100'>
        <div className='bb b--black-10 overflow-auto flex-grow'>
          {!isLoading && Object.keys(unitsDict).map(unitTitle => {
            const isExpanded = this.state.expandedUnits.includes(unitTitle)
            const openCases = filterOpenCases(unitsDict[unitTitle])
            const closedCases = filterClosedCases(unitsDict[unitTitle])
            const caseStatus = unitsShowOpenDict[unitTitle]
            const selectedCases = caseStatus ? openCases : closedCases
            return (
              <div key={unitTitle}>
                <div className='flex items-center h3 bt b--light-gray'
                  onClick={evt => this.handleExpandUnit(evt, unitTitle)}>
                  <FontIcon className='material-icons mh3' style={unitIconsStyle}>home</FontIcon>
                  <div className='flex-grow ellipsis mid-gray'>
                    {unitTitle}
                    <div className={'f6 silver mt1'}>
                      {unitsDict[unitTitle].length } cases
                    </div>
                  </div>
                  <FontIcon className={'material-icons mr2 pr1' + (isExpanded ? ' rotate-90' : '')}
                    style={unitIconsStyle}>
                    keyboard_arrow_right
                  </FontIcon>
                </div>
                {isExpanded && (
                  <ul className='list bg-light-gray ma0 pl0 shadow-in-top-1'>
                    <div className='flex pl3 pv3 bb b--very-light-gray'>
                      <div onClick={this.handleOpenClicked.bind(this, unitTitle)} className={'f6 fw5 ' + (caseStatus ? 'mid-gray' : 'silver')}>
                        { openCases.length } Open
                      </div>
                      <div onClick={this.handleClosedClicked.bind(this, unitTitle)} className={'f6 fw5 ml2 ' + (caseStatus ? 'silver' : 'mid-gray')}>
                        { closedCases.length } Closed
                      </div>
                    </div>
                    {selectedCases.map(caseItem => (
                      <li key={caseItem.id} className='h2-5 bt b--black-10'>
                        <div className='flex items-center'>
                          <Link
                            className={
                              'link flex-grow ellipsis ml3 pl1 ' +
                                (isClosed(caseItem) ? 'silver strike' : 'bondi-blue')
                            }
                            to={`/case/${caseItem.id}`}
                            onClick={() => dispatch(storeBreadcrumb(match.url))}
                          >
                            {caseItem.title}
                          </Link>
                          <IconButton>
                            <FontIcon className='material-icons' color={moreIconColor}>more_horiz</FontIcon>
                          </IconButton>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
        {!isLoading && (
          <RaisedButton fullWidth backgroundColor='var(--bondi-blue)' onClick={() => dispatch(push('/case/new'))}>
            <span className='white f4 b'>
              Create New Case
            </span>
          </RaisedButton>
        )}
      </div>
    )
  }
}

CaseExplorer.propTypes = {
  caseList: PropTypes.array,
  isLoading: PropTypes.bool,
  casesError: PropTypes.object,
  dispatchLoadingResult: PropTypes.func.isRequired
}

let casesError
const connectedWrapper = connect(
  () => ({}) // map redux state to props
)(createContainer(() => { // map meteor state to props
  const casesHandle = Meteor.subscribe(`${collectionName}.associatedWithMe`, {
    onStop: (error) => {
      casesError = error
    }
  })
  return {
    caseList: Cases.find().fetch(),
    isLoading: !casesHandle.ready(),
    casesError
  }
}, CaseExplorer))

connectedWrapper.MobileHeader = ({onIconClick}) => (
  <RootAppBar title='Cases' onIconClick={onIconClick} />
)

connectedWrapper.MobileHeader.propTypes = {
  onIconClick: PropTypes.func.isRequired
}

export default withRouter(connectedWrapper)
