import React, { Component } from 'react';

var $ = require('jquery');

export default class StartMenuStatus extends Component {
	constructor(props,context){
		super(props,context);
		this.state = {
			messages: {},
			passes: {},
			fails: {},
			stat: 'Pending...'
		};

	}
		

	render(){
		return(
			<div>	<div>
				</div>
				<div className="status">
				</div>
				<div className="failureDisplay">
				</div>
				<div className="successDisplay">
				</div>
			</div>
		);
	}
}
