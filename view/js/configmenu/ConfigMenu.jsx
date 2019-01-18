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


export default class ConfigMenu extends Component{
	constructor(props,context){
		super(props,context);
		this.state = {
			expectedTables:[],
			channelNaming:[]
		}
		this.createItem = this.createItem.bind(this);
	}
	componentDidMount(){
		$.get(window.location.href+'/allowable-metadata', (data) =>{
			var e = data.expected_value;
			var c = data.channel_naming;
			this.setState({
				expectedTables:e,
				channelNaming:c
			});
		});
	}
	createItem(name){
		return(
			<details className='l-2' key={name}>
				<summary>{name}</summary>
					<ConfigContainer tableName={name} 
					columns={expectedColumns}
					className='config-container'/>
			</details>
			);
	}		

	render(){
		return(
			<div className="config-menu">
				<details className='l-1'>
					<summary>Expected Values</summary>
					{this.state.expectedTables.map(tab => {return(this.createItem(tab))})}
				</details>
				<details className='l-1'>
					<summary>Channel Layout</summary>
					{this.state.channelNaming.map(c =>{return(this.createItem(c))})}
				</details>
			</div>
			);
	}
}
