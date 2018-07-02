import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import {
  moreIconColor
} from './case-explorer.mui-styles'

export const isClosed = caseItem => ['RESOLVED', 'VERIFIED', 'CLOSED'].includes(caseItem.status)

export class CaseList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      caseStatus: true
    }
  }
  render () {
    const allCases = this.props.allCases
    const openCases = allCases.filter(x => !isClosed(x))
    const closedCases = allCases.filter(x => isClosed(x))
    const selectCases = this.props.status === 1 ? closedCases : openCases
    console.log(selectCases)
    return (
      <div>
        {selectCases.map(caseItem =>
          <li key={caseItem.id} className='h2-5 bt b--black-10'>
            <div className='flex items-center'>
              <Link
                className={
                  'link flex-grow ellipsis ml3 pl1 ' +
                    (isClosed(caseItem) ? 'silver strike' : 'bondi-blue')
                }
                to={`/case/${caseItem.id}`}
                onClick={() => this.props.onItemClick}
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

CaseList.propTypes = {
  allCases: PropTypes.array,
  onItemClick: PropTypes.func.isRequired
}
