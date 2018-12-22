import React, { Component } from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import Progress from 'react-progressbar';
import ChannelSelector from './ChannelSelector';
import StartMetadata from './StartMetadata';
import SignalSelector from './SignalSelector';

var $ = require('jquery');
var socket = io.connect('http://' + document.domain + ':' + location.port);

export default class StartMenu extends Component { 
	constructor(props,context){
		super(props,context);
		this.displayChannelLayout = this.displayChannelLayout.bind(this);
		this.displaySignalLayout = this.displaySignalLayout.bind(this);
		this.updateSignal = this.updateSignal.bind(this);
		this.updateChannel = this.updateChannel.bind(this);
		this.state = {layout: [], signals:[], selectedSignals:[], selectedChannels:[], tests:{'connected':false,'disconnected':false}}
		this.getLayout('channel-layout', this.displayChannelLayout);
		this.getLayout('signal-list',this.displaySignalLayout);
	}

	getLayout(u, cb){
		$.get(window.location.href+u, (response) => {
			cb(response);
		});
	}

	displayChannelLayout(data){
		this.setState({
			layout: data
		});
	}

	displaySignalLayout(data){
		this.setState({
			signals: data
		});
	}
	
	updateSignal(key, e){
		if(this.state.selectedSignals[key]==null){
			this.setState({
				selectedSignals: {
					[key]: true
				}
			});
		}
		else{
			this.setState({
				selectedSignals: {
					[key]: !this.state.selectedSignals[key]
				}
			});
		}
	}

	updateChannel(key, e){
		if(this.state.selectedChannels[key]==null){
			this.setState({
				selectedChannels: {
					[key]: true
				}
			});
		}
		else{
			this.setState({
				selectedChannels: {
					[key]: !this.state.selectedChannels[key]
				}
			});
		}
	}
	updateTests(key, e){
		this.setState({
			tests:{
				[key]: !this.state.tests[key]
			}
		});
	}

	render(){
		return(
			<div className="currentCheck">
				<StartMetadata/>
				<div className='left-50'>
					<ChannelSelector layout={this.state.layout} callback={this.updateChannel} checked={this.state.selectedChannels} />
				</div>
				<div className='right-50'>
					<SignalSelector signals={this.state.signals} callback={this.updateSignal} checked={this.state.selectedSignals} />
				</div>
				<div className='bottom-100'>
					<label> Connected 
						<input type='checkbox' 
							onChange={this.updateTests.bind(this, 'connected')}/>
					</label>
					<label> Disconnected
						<input type='checkbox'
							onChange={this.updateTests.bind(this, 'disconnected')}/>
					</label>
				</div>
			</div>
		);
	}
}
