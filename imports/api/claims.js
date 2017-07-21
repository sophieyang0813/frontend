import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { callAPI } from '../util/bugzilla-api'

if (Meteor.isServer) {
  /**
   This publication is using the low-level meteor API to manage a published collection to the client
   It has five available methods on 'this':
   - added(collection-name, id, attributes) - adds a new document
   - changed(collection-name, id, attributes) - changes an existing document and modifies the attributes
   - removed(collection-name, id) - removed an existing document by id
   - ready() - notifies the subscribed client of the initial success of the subscription with the initial data
   - onStop(callback) - adds a handler for when a subscribed client removes its subscription
   */
  Meteor.publish('claims', function () {
    // Fetching simple data
    callAPI('get', '/rest/bug/21')
      .then(data => {
        this.added('claims', '1', data.bugs[0])
        this.ready()
      })
      .catch(err => {
        // TODO: make this method handle errors better, or be less prone to errors
        console.error(err)
        throw new Meteor.Error({message: 'REST API error', origError: err})
      })
  })
}
let Claims
if (Meteor.isClient) {
  Claims = new Mongo.Collection('claims')
}

export default Claims
