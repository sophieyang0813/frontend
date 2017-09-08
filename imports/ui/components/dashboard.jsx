import React from 'react'

export class Dashboard extends React.Component {
  render () {
    return (
      <main>
        <h1 className='f-6'>Hello, World!</h1>
        <p>As defined in routes.jsx</p>
        <ul>
          <li><a href='/'>Login page</a></li>
          <li><a href='/signup'>Signup</a></li>
          <li><a href='/dashboard'>Dashboard</a></li>
          <li><a href='/unit/new'>New unit</a></li>
          <li><a href='/demo-claim'>Demo claim</a></li>
          <li><a href='/todo'>TODO</a></li>
        </ul>
      </main>
    )
  }
}
