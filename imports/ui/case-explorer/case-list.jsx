import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import { isClosed } from '../../api/cases'
import { storeBreadcrumb } from '../general-actions'
import {
  moreIconColor
} from './case-explorer.mui-styles'

export class Caselist extends Component {
  constructor (props) {
    super(props)
    this.state = {
      caseStatus: true
    }
  }
  render () {
    const { dispatch, match } = this.props
    const openCases = this.props.openCases
    const closedCases = this.props.closedCases
    const selectCases = this.state.caseStatus ? openCases : closedCases
    return (
      <div>
        <div className='flex pl3 pv3 bb b--very-light-gray'>
          <div onClick={() => this.setState({caseStatus: true})} className={'f6 fw5 ' + (this.state.caseStatus ? 'mid-gray' : 'silver')}>
            {this.props.openCases.length} open
          </div>
          <div onClick={() => this.setState({caseStatus: false})} className={'f6 fw5 ml2 ' + (this.state.caseStatus ? 'silver' : 'mid-gray')}>
            {this.props.closedCases.length} closed
          </div>
        </div>
        {selectCases.map(caseItem =>
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
          )}
      </div>
    )
  }
}
