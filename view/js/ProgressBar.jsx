import React, { Component } from 'react';
import io from 'socket.io-client';
import Progress from 'react-progressbar';

var socket = io.connect('http://' + document.domain + ':' + location.port);

export default class ProgressBar extends Component{
	constructor(props,context){
		super(props,context)

		this.handleUpdate = this.handleUpdate.bind(this);
		this.state = {
			completed: 0
		}

		socket.on('connect', (socket) => {});
		socket.on('checkUpdate', (data) => {this.handleUpdate(data)});
	}

	handleUpdate(data){
		var key = data['key']
		var val = data['value']
		var comp = 100*data['complete']
		this.setState({
			completed: comp
		});
		console.log(this.state)
	}

	render(){
		return(
			<div>{this.state.completed}
				<Progress completed={this.state.completed}/>
			</div>
			);
	}
}
