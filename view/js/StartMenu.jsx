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
		this.displayMetadata = this.displayMetadata.bind(this);
		this.updateSignal = this.updateSignal.bind(this);
		this.updateChannel = this.updateChannel.bind(this);
		this.submitTests = this.submitTests.bind(this);
		this.state = {layout: [], 
			signals:[], 
			selectedSignals:[],
			selectedChannels:[],
			tests: [],
			metadata:{expected:[],device:[],inst:[],wiring:[]}
		}
		this.getLayout('channel-layout', this.displayChannelLayout);
		this.getLayout('signal-list',this.displaySignalLayout);
		this.getLayout('allowable-metadata', this.displayMetadata);
	}
	componentDidUpdate(){
	}
	getLayout(u, cb){
		$.get(window.location.href+u, (response) => {
			cb(response);
		});
	}

	displayMetadata(data){
		console.log(data);
		this.setState({
			metadata: data
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
		console.log(key,e);
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
			<div className='menu'>
				<div className='metadata'>
					<StartMetadata options={this.state.metadata} callback={this.updateTests}/>
				</div>
				<div className='test-selectors'>
					<div className="selector">
						<h1>Select Channels </h1>
							<ChannelSelector layout={this.state.layout} 
								callback={this.updateChannel} 
								checked={this.state.selectedChannels} />
					</div>
					<div className='selector'>
						<h1> Select Signals </h1>
						<div className='selector-opt'>
							<SignalSelector signals={this.state.signals} 
								callback={this.updateSignal} 
								checked={this.state.selectedSignals} />
						</div>
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
