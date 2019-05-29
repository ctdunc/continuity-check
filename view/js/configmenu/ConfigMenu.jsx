import React, { Component } from 'react';
import ConfigContainer from './ConfigContainer';

var $ = require('jquery');

const expectedColumns = [
	{Header:"Signal 1", accessor:'0'},
	{Header:"Channel 1",accessor:'1'},	
	{Header:"Signal 2 ",accessor:'2'},	
	{Header:"Channel 2",accessor:'3'},	
	{Header:"Expected Continuity",accessor:'4'},	
	{Header:"Minimum",accessor:'5'},	
	{Header:"Maximum",accessor:'6'}
]
const namingColumns = [
	{Header:"Matrix Location", accessor:'0'},
	{Header:"DB 78 pin", accessor:'1'},
	{Header:"VIB pin", accessor:'2'},
	{Header:"Signal", accessor:'3'},
	{Header:"Channel",accessor:'4'},	
	{Header:"Type",accessor:'5'},	
]

export default class ConfigMenu extends Component{
	constructor(props,context){
		super(props,context);
		this.state = {
			expected:[],
			naming:[],
			expanded:''
		}

		this.createItem = this.createItem.bind(this);
	}
	componentDidMount(){
		$.get(window.location.href+'/expected-value', (data) => {
			this.setState({
				expected:data
			})
		});
		$.get(window.location.href+'/channel-layout/all', (data)=> {
			this.setState({
				naming:data
			})
		});
	}

	createItem(key,columns,urlbeg){
		return(
			<details className='l-2' key={key}>
				<summary>{key}</summary>
					<ConfigContainer tableName={key} 
					columns={columns}
					urlLead={urlbeg}
					className='config-container'/>
			</details>
			);
	}		

	render(){
		return(
			<div className="menu">
				<div className="signal">
					<h1>Signal Layout</h1>
					{this.state.expected.map(key => {
						return(
							this.createItem(
								key,
								expectedColumns,
								'expected-value'
							)
						)
					})}
				</div>
				<div className="channel">
					<h1>Channel Layout</h1>
					{Object.keys(this.state.naming).map(key => {
						return(
							this.createItem(
								key,
								namingColumns,
								'channel-naming'						
							)
						)
					})}
				</div>
			</div>
			);
	}
}

class ConfigItem extends Component{
	constructor(props,context){
		super(props,context);
		this.setState({
			open: false
		});
	}

	render(){
		return(
			<details className="config-menu">
				<summary>{this.props.key}</summary>
				<ConfigContainer tableName={this.props.key}
					columns={this.props.columns}
					urlLead={this.props.urlLead}
					className='config-container'/>
			</details>
		);
	}
}
