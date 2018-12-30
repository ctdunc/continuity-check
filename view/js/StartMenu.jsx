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
		this.submitTests = this.submitTests.bind(this);
		this.state = {layout: [], 
			signals:[], 
			selectedSignals:[],
			selectedChannels:[],
			tests: []}
		this.getLayout('channel-layout', this.displayChannelLayout);
		this.getLayout('signal-list',this.displaySignalLayout);
	}
	componentDidUpdate(){
		console.log(this.state);
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
		var signals = this.state.selectedSignals
		var index = signals.indexOf(key);
		if(index==-1){
			signals = [...signals, key]
		}
		else{
			signals.splice(index,1);
		}
		this.setState({selectedSignals:signals});
	}

	updateChannel(key, e){
		var channels = this.state.selectedChannels
		var index = channels.indexOf(key)
		if(index==-1){
			channels = [...channels,key]
		}
		else{
			channels.splice(index,1);
		}
		this.setState({selectedChannels: channels})
	}
	
	updateTests(key, e){
		var tests = this.state.tests
		var index = tests.indexOf(key)
		if(index==-1){
			tests = [...tests,key]
		}
		else{
			tests = tests.splice(index,1);
		}
		this.setState({tests:tests});
	}
	
	submitTests(e){
		$.ajax({
			type: 'POST',
			url: '/startcheck',
			data: {signals: this.state.selectedSignals, 
				channels: this.state.selectedChannels,
				continuity: this.state.tests},
			success: ((data, stat, request) => {
			}),
			error: (() => {
				alert('an error occured');
			})
		});
	}

	render(){
		return(
			<div className="startMenu">
				<div className='startMetadata'>
					<StartMetadata expectedValues={['slac_expected_values', 'berkeley_expected_values']}/>
				</div>
				<div className="test-selector">
					<div className='left-50'>
						<h1 className="channelHeader"> Select Channels </h1>
						<ChannelSelector layout={this.state.layout} 
							callback={this.updateChannel} 
							checked={this.state.selectedChannels} />
					</div>
					<div className='right-50'>
						<h1 className="signalHeader"> Select Signals </h1>
						<SignalSelector signals={this.state.signals} 
							callback={this.updateSignal} 
							checked={this.state.selectedSignals} />
					</div>
				</div>
				<div className='bottom-100'>
					<b className="continuity-label"> Select Continuity:</b>
					<label> Connected 
						<input type='checkbox' 
							onChange={this.updateTests.bind(this, 'connected')}/>
					</label>
					<label> Disconnected
						<input type='checkbox'
							onChange={this.updateTests.bind(this, 'disconnected')}/>
					</label>
					<button type="submit" onClick={this.submitTests}> Start Check </button>
				</div>
			</div>
		);
	}
}
