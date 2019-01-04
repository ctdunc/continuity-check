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
		this.updateTests = this.updateTests.bind(this);
		this.updateContinuity = this.updateContinuity.bind(this);
		this.submit = this.submit.bind(this);
		this.state = {layout: [], 
			signals:[], 
			selectedSignals:[],
			selectedChannels:[],
			tests: {},
			metadata:{expected:[],device:[],inst:[],wiring:[]},
			continuity:[]
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
		//also creates initial test state with first value obtained from SQL table
		var tests = {} 
		let keys = Object.keys(this.state.metadata);
		for(var k in keys){
			k = keys[k]
			tests[k] = data[k][0]
		}
		this.setState({
			metadata: data,
			tests: tests
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
		var tests = this.state.tests;
		tests[key] = e.target.value
		console.log(tests);
	}
	updateContinuity(key,e){
		var continuity = this.state.continuity
		var index = continuity.indexOf(key)
		if(index==-1){
			continuity = [...continuity,key]
		}
		else{
			continuity = continuity.splice(index,1);
		}
		this.setState({continuity:continuity});
	}
	
	submit(e){
		$.ajax({
			type: 'POST',
			url: '/startcheck',
			data: {signals: this.state.selectedSignals, 
				channels: this.state.selectedChannels,
				continuity: this.state.continuity,
				metadata: this.state.tests},
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
							onChange={this.updateContinuity.bind(this, 'connected')}/>
					</label>
					<label> Disconnected
						<input type='checkbox'
							onChange={this.updateContinuity.bind(this, 'disconnected')}/>
					</label>
					<button type="submit" onClick={this.submit}> Start Check </button>
				</div>
			</div>
		);
	}
}
