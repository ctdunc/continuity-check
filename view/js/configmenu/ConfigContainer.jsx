import React, { Component } from 'react';

export default class ConfigContainer extends Component{
	constructor(props, context){
		super(props,context);
	}

	render(){
		/* TODO:
		 *	get list of existing tables, option to edit, delete for each table
		 *
		 *
		 */
		return(
			<div className='config-container'>
				<h1> {this.props.tableName} </h1>
			</div>
			);
	}
}

