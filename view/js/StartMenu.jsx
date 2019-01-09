import React, { Component } from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import Progress from 'react-progressbar';
import ChannelSelector from './ChannelSelector';
import StartMetadata from './StartMetadata';
import SignalSelector from './SignalSelector';
import Selector from './Selector';

var $ = require('jquery');
var socket = io.connect('http://' + document.domain + ':' + location.port);

export default class StartMenu extends Component { 
	constructor(props,context){
		super(props,context);
		this.update =  this.update.bind(this);
		this.updateAll = this.updateAll.bind(this);
		this.updateContinuity = this.updateContinuity.bind(this);
		this.submit = this.submit.bind(this);

		this.state = {
			keys:[],
			channels:{},
			signals:{},
			continuity:[],
			metadata:{
				device:[],
				inst:[],
				expected:[],
				wiring:[]
			},
			selected:{
				channels:[],
				signals:[],
				metadata:[]
			}
		}
	}
	
	componentDidMount(){
		$.get(window.location.href+'channel-layout', (data) => {
			var cs = this.state
	
			for(var type in data){
				var typeInfo = data[type];
				cs.keys=[...cs.keys,type];
				cs.channels[type] = [...Array(typeInfo.channels).keys()];
				cs.signals[type] = typeInfo.signals;
				this.setState({
					channels:cs.channels,
					signals:cs.signals,
					keys:cs.keys
				});
			}
			});
		$.get(window.location.href+'allowable-metadata', (data) =>{
			this.setState({
				metadata:data
			});
		});
		this.forceUpdate();
	}
	
	update(key,type,e){
		var data = e.target.name;
		var s = this.state.selected;
		var t = s[key];
		var i = t[type].indexOf(data);
		if(i==-1){
			t[type] = [...t[type],data]
		}
		else{
			t.splice(i,1);
		}
		s[key] = t
		console.log(t)
		this.setState({
			selected:s
		});
	}

	updateAll(key,type){
		var s = this.state.selected;
		var c = s[key];
		if(c[type] && c[type].length!=0){
			c[type] = []
		}else{
			c[type] = this.state[key][type]
		}
		
		s[key][type] = c[type]
		this.setState({
			selected:s
		});
		console.log(this.state.selected);
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
			data: {signals: this.state.selected.signals, 
				channels: this.state.selected.channels,
				continuity: this.state.continuity,
				metadata: this.state.selected.metadata},
			success: ((data, stat, request) => {
			}),
			error: ((e) => {
				alert(e);
			})
		});
	}

	render(){
		return(
			<div className='menu'>
				<div className='metadata'>
					<StartMetadata options={this.state.metadata} callback={()=>{}}/>
				</div>
				<div className='channel'>
					<h1>Select Channels</h1>
					<div className='select-container'>
						{this.state.keys.map((key) => {return(
							<Selector className='channel'
								name={key} 
								key={key+'-channel'} 
								opts={this.state.channels[key]}
								callback={this.update.bind(this,'channels',key)}
								allback={this.updateAll.bind(this,'channels',key)}/>
							)})}
					</div>
				</div>
				<div className='signal'>
					<h1>Select Signals</h1>
					<div className='select-container'>
						{this.state.keys.map((key) =>{return(
							<Selector className='signal' 
								name={key} 
								key={key+'-signal'}
								opts={this.state.signals[key]}
								callback={this.update.bind(this,'signals')}
								allback={this.updateAll.bind(this,'signals')}/>
							)})}
					</div>
				</div>
				<div className='continuity'>
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
