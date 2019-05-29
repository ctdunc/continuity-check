import React, { Component } from 'react';
import ReactTable from 'react-table';

var $ = require('jquery');
export default class ConfigContainer extends Component{
	constructor(props, context){
		super(props,context);
		this.state = {entries: []}
	}
	
	componentDidMount(){

		$.get(window.location.href+this.props.urlLead+'/'+this.props.tableName, (data) => {
			console.log(data);
			this.setState({
				entries: data
			})
		})
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
					data={this.state.entries}
					/>
			</div>
			);
	}
}

