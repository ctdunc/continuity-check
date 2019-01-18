import React, { Component } from 'react';
import ReactTable from 'react-table';
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
				<ReactTable 
					columns={this.props.columns}
					/>
			</div>
			);
	}
}

