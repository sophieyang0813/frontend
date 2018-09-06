import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

export function ReportList ({ allReports, onItemClick }) {
  return (
    <div>
      {allReports.map((reportItem, ind) =>
        <li key={reportItem.id} className='h2-5 bt b--black-10'>
          <div className='flex items-center'>
            <Link
              className={'link flex-grow ellipsis ml3 pl1 pv3 bondi-blue'}
              to={`report/${reportItem.id}/review`}
              onClick={onItemClick}
            >
              {reportItem.title}
            </Link>
          </div>
        </li>
      )}
    </div>
  )
}

ReportList.propTypes = {
  allReports: PropTypes.array.isRequired,
  onItemClick: PropTypes.func.isRequired
}
