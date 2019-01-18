import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

var $ = require('jquery');

const histCols = [
	{Header:"Date",accessor:'0'},
	{Header:"Institution",accessor:'1'},
	{Header:"VIB",accessor:'2'},
	{Header:"Wiring",accessor:'3'},
	{Header:"Device",accessor:'4'},
	{Header:"Temperature",accessor:'5'},
	{Header:"Validator",accessor:'6'},
	{accessor: '7'}
]
const checkCols = [
	{Header: "Signal",
		columns: [
			{Header:"Signal 1",accessor:'0'},
			{Header:"Channel 1", accessor:'1'},
			{Header:"Signal 2",accessor:'2'},
			{Header:"Channel 2", accessor:'3'}
			]
	},
	{Header: "Continuity",
		columns: [
			{Header:"Minimum",accessor:'4'},
			{Header:"Maximum",accessor:'5'},
			{Header:"Measured",accessor:'6'},
			{Header:"Unit",accessor:'7'},
			{Header:"Passed",accessor:'8'}
		]}
]
class DataDisplay extends Component{
	constructor(props,context){
		super(props,context);
		this.state = {
			data:[],
			columns: histCols,
			display: 'history'
		};
		
		this.getRuns=this.getRuns.bind(this);
		this.displayRuns=this.displayRuns.bind(this);
		this.getCheck=this.getCheck.bind(this);
		this.displayCheck=this.displayCheck.bind(this);

		this.getRuns();
	}

	getCheck(tname){
		$.get(window.location.href+'continuity-history/'+tname,
			(data) =>{
				this.displayCheck(tname,data);
			}
		);
	}

	displayCheck(tname,data,cb){
		this.setState({
			columns: checkCols,
			data: data,
			display: tname
		});
	}

	getRuns(){
		$.get(window.location.href+'continuity-history', 
			(data) =>{
				console.log(data);
				this.displayRuns(data);
			}
		);
	}

	displayRuns(data){
		this.setState({
			display: 'history',
			data: data,
			columns: histCols
		});
	}

	render(){
		if(this.state.display=='history'){
			return(
				<div>
					<ReactTable data={this.state.data}
						columns={this.state.columns}
						className="-striped -highlight"
						style={{
							height: "100%"
						}}
						SubComponent ={({row,nestingPath,toggleRowSubComponent}) => {
							{this.getCheck(row[7])}
						}}
					/>
				</div>
			);
		}
		else{
			return(
				<div>
					<button onClick={this.getRuns}> Return to Log</button>
					<ReactTable data={this.state.data}
						columns={this.state.columns}
						style={{
							height: "100%"
						}}
					/>
				</div>
			);
		}
	}
}
export default DataDisplay;
