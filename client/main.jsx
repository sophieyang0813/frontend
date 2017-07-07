import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import App from '../imports/ui/app.jsx';
import Claim from '../imports/ui/claim/claim.jsx';
import '../imports/startup/accounts-config.js';

import { Provider } from 'react-redux';
import Store from '../imports/state/store';

function AppRoot() {
	return (
		<Provider store={Store}>
			{/*<App/>*/}
			<Claim></Claim>
		</Provider>
	);
}

Meteor.startup(() => {
	render(<AppRoot />, document.getElementById('render-target'));
});