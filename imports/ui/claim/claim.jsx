import React, { Component, PropTypes } from 'react'
import { connect }  from 'react-redux'
import { createContainer } from 'meteor/react-meteor-data'
import moment from 'moment'
import { Claims } from '../../api/claims'

import './claim.css'

// const dateFormat = 'DD MMM YYYY'
function formatDate(date) {
    return moment(date).format('DD MMM YYYY')
}

class Claim extends Component {
	render() {
		const { claim } = this.props
		if (! claim) return <h1>Loading...</h1>

		console.log('claim', claim);

		return (
			<div className="claim-container">
				{this.renderTitle(claim)}
				{this.renderStatusLine(claim)}
				{this.renderDependenciesLine(claim)}
				{this.renderBody(claim)}
			</div>
		)
	}

	renderTitle({ id, summary, creation_time }) {
		return (
			<div className="claim_title-bar claim_section">
				<div className="claim_id">{id}</div>
				<div className="claim_title claim_item-flow" title={summary}>{summary}</div>
				<div className="claim_button-container">
					<button className="edit-button"><i className="icon icon-edit"></i></button>
				</div>
				<div className="claim_creation-date">{formatDate(creation_time)}</div>
			</div>
		)
	}

	renderStatusLine({ status, last_change_time }) {
		return (
			<div className="claim_section">
				<div className="claim_status">
					<select name="status">
						<option value={status}>{status}</option>
					</select>
				</div>
				<div className="claim_update-date claim_item-flow" title={formatDate(last_change_time)}>
					Since {formatDate(last_change_time)}
				</div>
				<div>
					<button>M</button>
				</div>
				<div>
					<button>H</button>
				</div>
			</div>
		)
	}

	renderDependenciesLine({ depends_on, blocks }) {
		return (
			<div className="claim_section">
				<div className="claim_dependencies-details claim_item-flow">
					<div className="claim_dependencies-details_labels">
						<div>Depends on:</div>
						<div>Blocks:</div>
					</div>
					<div className="claim_dependencies-details_values">
						<div>{depends_on.length ? depends_on.join(', ') : ' -'}</div>
						<div>{blocks.length ? depends_on.join(', ') : ' -'}</div>
					</div>
				</div>
				<div className="claim_dependecies-edit">
					<div>
						<button className="edit-button edit-depends-on"><i className="icon icon-edit"></i></button>
					</div>
					<div>
						<button className="edit-button edit-blocks"><i className="icon icon-edit"></i></button>
					</div>
				</div>
				<div className="claim_dependency-tree-access">
					<div className="claim_dependency-tree-access_label">
						Dependency<br/>trees
					</div>
					<div className="claim_dependency-tree-access_button">
						<button className="tree-viewer-button"><i className="icon icon-tree"></i></button>
					</div>
				</div>
			</div>
		)
	}

	renderBody({}) {
		return <div className="claim_section">
			<h1>asdasdsad</h1>
		</div>
	}
}

Claim.propTypes = {
	claim: PropTypes.object,
}

const ClaimContainer = createContainer(() => {
	Meteor.subscribe('claims');

	return {
		claim: Claims.findOne({}),
	}
}, Claim)

function mapStateToProps(state) {
	return {
	}
}


export default connect(mapStateToProps)(ClaimContainer)