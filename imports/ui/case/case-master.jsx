import React, { Component } from 'react'
import { Route, Switch, matchPath } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import _ from 'lodash'
import { UneeTIcon } from '../components/unee-t-icons'
import { setDrawerState } from '../general-actions'
import { updateSearch } from './case-search.actions'
import CaseExplorer from '../case-explorer/case-explorer'
import Preloader from '../preloader/preloader'
import Case from './case'
import RootAppBar from '../components/root-app-bar'
import {
  emptyPaneIconStyle
} from './case-master.mui-styles'

const isMobileScreen = window.matchMedia('screen and (max-width: 768px)').matches

class CaseMaster extends Component {
  constructor () {
    super(...arguments)
    this.state = {
      componentsProps: {},
      isLoading: true,
      isSubLoading: false,
      searchText: '',
      searchResult: [],
      searchMode: false
    }
    this.routes = [
      {
        path: '/case',
        RouteComp: CaseExplorer,
        exact: true
      },
      {
        path: '/case/:caseId',
        RouteComp: Case
      }
    ]
  }
  getMatchingPath (props) {
    // Finding the matching path out of the list of routes, using "matchPath" which has the same matching logic as Route
    const routeMatches = this.routes.reduce((matching, route) => {
      const match = matchPath(props.location.pathname, route)
      if (match) {
        matching.push(match)
      }
      return matching
    }, [])

    // It should match at least 1, but could be more (Switch takes the first), checking 'length' in case of bad config
    return routeMatches.length && routeMatches[0]
  }
  componentWillMount () {
    // Keeping the initial match
    this.matchingPath = this.getMatchingPath(this.props)
  }
  componentWillReceiveProps (nextProps) {
    // Comparing with the next match to see if the route component is switched and will begin loading data
    const nextMatch = this.getMatchingPath(nextProps)

    if (this.matchingPath.path !== nextMatch.path || !_.isEqual(this.matchingPath.params, nextMatch.params)) {
      this.matchingPath = nextMatch
      if (isMobileScreen) {
        this.setState({
          isLoading: true
        })
      } else {
        this.setState({
          isSubLoading: true
        })
      }
    }
  }
  handleIconClick = () => {
    this.props.dispatch(setDrawerState(true))
  }

  handleSearch = (searchText) => {
    this.setState({ searchText: searchText })
    console.log('searchText', searchText)
    if (searchText === '') {
      this.setState({ searchMode: false })
    } else {
      this.setState({ searchMode: true })
      const matcher = new RegExp(searchText, 'i')
      const searchResult = this.state.componentsProps['/case'].caseList
        .filter(x => !matcher || (x.title && x.title.match(matcher)))
      this.props.dispatch(updateSearch(searchText, searchResult))
      console.log('master search')
    }
  }

  render () {
    const { isLoading, componentsProps, searchText, searchResult, caseSearchState } = this.state
    const { user } = this.props
    console.log('this props casemasters', this.props.caseSearchState)
    return (
      <div className='flex flex-column full-height roboto overflow-hidden'>
        {isLoading ? (
          <Preloader />
        ) : isMobileScreen ? (
          <Switch>
            {this.routes.map(({ path, RouteComp, exact = false }) => (
              <Route key={path} exact={exact} path={path} render={() => (
                <RouteComp.MobileHeader contentProps={componentsProps[path]}
                  onIconClick={this.handleIconClick}
                  searchText={searchText}
                  onSearchChanged={this.handleSearch}
                />
              )} />
            ))}   
            {/* for case explore & cases, givce mobileheader ; what is compnentsProps path? */}
          {/* how is routecomp.mobileheader connected to connectedwrapper in case-explorer? why is it useful to connect connectedWrapper to mobileheader? */}
            {/* a. connectedwrapper: why use connected and createContainer? they just seem to fetch lots of data? how is this relevant to mobile header?  */}
            {/* know what createcontainer & connect do; explain how they are connected in your words; before asking */}

          {/* when is contentProps used? how does componentsProps know the case list? */}
          {/* how does switch work? it overrides it current locatio nmatches;  */}
          {/* why pass contentProps when not using it?  */}
          </Switch>
        ) : (
          <RootAppBar title='Open Cases'
            onIconClick={this.handleIconClick}
            searchText={searchText}
            onSearchChanged={this.handleSearch}
            showSearch
            user={user}
            cases
          />
        )}
        {isMobileScreen ? (
          <Switch>
            {this.routes.map(({ path, RouteComp, exact }) => (
              <Route key={path} exact={exact} path={path} render={() => {
                return (
                  <RouteComp searchResult={searchResult} className={isLoading ? 'dn' : ''} dispatchLoadingResult={data => {
                    this.setState({
                      componentsData: Object.assign(componentsProps, { [path]: data }),
                      isLoading: false
                    })
                  }} />
                )
              }} />
            ))}
          </Switch>
        ) : (
          <div className={isLoading ? 'dn' : 'flex flex-grow overflow-hidden'}>
            <div className='flex-3'>
              <CaseExplorer
                searchText={searchText}
                // searchResult={caseSearchState}
                dispatchLoadingResult={() => {
                  this.setState({
                    isLoading: false
                  })
                }} />
            </div>
            <div className='flex-10 flex items-center justify-center bg-very-light-gray h-100'>
              <Route path='/case/:caseId' children={({ match }) => {
                if (match) {
                  const { isSubLoading } = this.state
                  return (
                    <div className='h-100 w-100'>
                      {isSubLoading && (
                        <Preloader />
                      )}
                      <Case className={isSubLoading ? 'dn' : ''} dispatchLoadingResult={() => {
                        this.setState({
                          isSubLoading: false
                        })
                      }} />
                    </div>
                  )
                } else {
                  return (
                    <div className='flex flex-column items-center'>
                      <UneeTIcon style={emptyPaneIconStyle} />
                      <div className='mt4 roboto f4 mid-gray'>Select a case on the left to begin</div>
                    </div>
                  )
                }
              }} />
            </div>
          </div>
        )}
      </div>
    )
  }
}

CaseMaster.propTypes = {
  user: PropTypes.object.isRequired
}

export default connect(
  ({ caseSearchState }) => ({ caseSearchState
  }) // map redux state to props
)(createContainer(() => ({
  user: Meteor.user() || {}
}), CaseMaster))
