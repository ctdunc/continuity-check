import React, { Component } from 'react';
import io from 'socket.io-client';
import Progress from 'react-progressbar';

import StartMenuForm from './StartMenu_Form';
import StartMenuStatus from './StartMenu_Status';

var $ = require('jquery');
var socket = io.connect('http://' + document.domain + ':' + location.port);

export default class StartMenu extends Component{
	constructor(props,context){
		super(props,context);
		this.state = {
			checkProps: {
				expected_table: '',
				tests: [],
				channels: [],
				institution: '',
				wiring: '',
				device: '',
				vib: ''
			},
			total: 1,
			complete: 0,
			percentcomplete: 0,
			running: false,
			messages: [],
			fails: [],
		};

		this.startTask = this.startTask.bind(this);
		this.handleUpdate = this.handleUpdate.bind(this);
		this.completePercentage = this.completePercentage.bind(this);

		socket.on('connect',(socket) => {});
		socket.on('checkStarted', (data) => {console.log(data);});
		socket.on('checkUpdate', (data) => {this.handleUpdate(data)});
	}

	startTask(e){
		if(!this.state.running){
			$.ajax({
				type: 'POST',
				url: '/continuitycheck',
				success: ((data, stat, request)=> {
					this.setState({running: true});
				}),
				error: (() => {
					alert('err');
					this.setState({running: false});
				})
			});
		}
		else{
			alert('Check already in progress! Please wait');
		}
		e.stopPropagation();
	}

	handleUpdate(data){
		var value = data['value'];
		console.log(data['key']);
		
		if(data['key'] == 'MSG' && data['key'] != 'MEASUREMENT'){
			this.setState({complete: this.state.complete+1})
			this.setState({messages: [...this.state.messages, value]});
		}
		else if (data['key']=='TOTAL'){
			console.log(data);
			this.setState({total: value});
		}
		else if (data['key'] == 'MEASUREMENT'){
			this.setState({complete: this.state.complete+1});
			if(!value['passing']){
				this.setState({fails: [...this.state.fails, value]});
			}
		}
	}

	completePercentage(comp){
		var percent = 100*comp/this.state.total;
		return(percent);
	}
	
	render(){
		return(
			<div className="startMenu">
				<div className="left-50">
					<StartMenuForm className="startMenuForm"
						startTask={this.startTask}/>
				</div>
				<div className="right-50">
					<div className="progressbar">
						<b>Progress:</b> {this.state.complete}/{this.state.total}
						<Progress completed={this.completePercentage(this.state.complete)} className="progr" />
					</div>
					<div className="messages">
						{this.state.messages.map((m,index) => 
							<div className='message' 
								key={index}>
								<b>{m}</b>
							</div>)
						}
					</div>
					<div className="failures">
						{this.state.fails.map((f,index) => 
							<Measurement key={index} 
								sig1={f.signal_1} 
								sig2={f.signal_2} 
							/>)
						}
					</div>
				<button onClick={this.startTask}> TEST </button>			</div>

			</div>
		);
	}
}



class Measurement extends Component {
	constructor(props,context){
		super(props,context);
		this.state = {
			'sig1': props.sig1,
			'sig2': props.sig2,
		}
	}

	render(){
		return(
			<div className='measurement'>
				<b>Signal 1</b>: {this.state.sig1},
				<b>Signal 2</b>: {this.state.sig2}
			</div>
		);
	}
}
