import { HTTP } from 'meteor/http';

if (Meteor.isServer) {
	const base = process.env.BUGZILLA_URL || 'http://localhost:8081'
	/**
		This publication is using the low-level meteor API to manage a published collection to the client
		It has five available methods on 'this':
			- added(collection-name, id, attributes) - adds a new document
	    - changed(collection-name, id, attributes) - changes an existing document and modifies the attributes
	    - removed(collection-name, id) - removed an existing document by id
	    - ready() - notifies the subscribed client of the initial success of the subscription with the initial data
	    - onStop(callback) - adds a handler for when a subscribed client removes its subscription
	 */
	Meteor.publish('claims', function() {

		// Fetching simple data
		HTTP.get(`${base}/rest/bug/1`, {/*options*/}, (err, result) => {
			if (err) throw new Meteor.Error({message: 'REST API error', origError: err})
			this.added('claims', '1', result.data.bugs[0])
			this.ready()
		})
	})
}

if (Meteor.isClient) {
	export const Claims = new Mongo.Collection('claims')
}
