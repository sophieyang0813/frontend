import React from 'react'
import { Link, Route } from 'react-router-dom'
import { Dashboard } from './components/dashboard.jsx'
import Claim from './claim/claim.jsx'
import App from './todo/app.jsx'

import AccountsUIWrapper from './accounts-ui-wrapper.jsx'

export class Routes extends React.Component {
  render () {
    return (
      <div>
        <AccountsUIWrapper />
        <Route exact path='/' component={Dashboard} />
        <Route exact path='/demo-claim' component={Claim} />
        <Route exact path='/todo' component={App} />
        <nav>
          <Link to='/'>Dashboard</Link>
        </nav>
      </div>
    )
  }
}
