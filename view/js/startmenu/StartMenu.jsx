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
		this.updateMetadata = this.updateMetadata.bind(this);
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
			},
			store:{
				channels:[],
				signals:[]
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
			var keys = Object.keys(data);
			var vals = {}
			keys.map((key) => {vals[key]=data[key][0]})
			var cursel = this.state.selected
			cursel.metadata = vals
			this.setState({
				metadata:data,
				selected:cursel
			});
		});
		this.forceUpdate();
	}
	
	update(toUpdate,type,e){
		var val = e.target.name;
		var s = this.state.selected;
		if(s[toUpdate]==undefined){
			s[toUpdate] = [val]
		}else{
			var t = s[toUpdate];
			var i = t.indexOf(val);
			if(i==-1){
				s[toUpdate]=[...t,val];
			}else{
				s[toUpdate].splice(i,1);
			}
		}
		this.setState({
			selected:s
		});
	}

	updateAll(key,type,disabled,e){
		const search = new RegExp('^'+type+'.*');
		const opts=this.state[key][type]
		var s = this.state.selected
		var sel = s[key]
		var store = this.state.store
		var st = store[key]
		if(!disabled){
			//add selected values to store, add all to state
			const found = sel.filter(el => el.match(search))	
			st = [...st,...found]
			store[key] = st
			
			sel = sel.filter(val=>!val.match(search))
			sel = [...sel, ...opts.map(o => type+'-'+o.toString())]
			s[key] = sel
			this.setState({selected:s,store:store});
		}else{
			//remove all values meeting critera from current state
			sel = sel.filter(val => !val.match(search))
			
			//add all values from store meeting criteria back to state
			var met = st.filter(val => val.match(search))
			st = st.filter(val => !val.match(search))
			sel = [...sel, ...met]
			s[key] = sel
			store[key] = st

			this.setState({selected:s,store:store});
		}
		return(!disabled);
	}

	updateMetadata(key,e){
		var s = this.state.selected
		s.metadata[key] = e.target.value
		this.setState({
			selected: s
		});
	}
	
	submit(e){
		$.ajax({
			type: 'POST',
			url: '/startcheck',
			data: {signals: this.state.selected.signals, 
				channels: this.state.selected.channels,
				continuity: this.state.selected.continuity,
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
					<StartMetadata options={this.state.metadata} callback={this.updateMetadata.bind(this)} />
				</div>
				<div className='channel'>
					<h1>Select Channels</h1>
					<div className='select-container'>
						{this.state.keys.map((key) => {return(
							<Selector className='channel'
								name={key} 
								key={key+'-channel'} 
								opts={this.state.channels[key]}
								selected={this.state.selected.channels}
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
								callback={this.update.bind(this,'signals',key)}
								allback={this.updateAll.bind(this,'signals',key)}/>
							)})}
					</div>
				</div>
				<div className='continuity'>
					<b className="continuity-label"> Select Continuity:</b>
					<label> Connected 
						<input type='checkbox' 
							name="connected"
							onChange={this.update.bind(this, 'continuity', 'connected')}/>
					</label>
					<label> Disconnected
						<input type='checkbox'
							name="disconnected"
							onChange={this.update.bind(this, 'continuity','disconnected')}/>
					</label>
					<button type="submit" onClick={this.submit}> Start Check </button>
				</div>
			</div>
		);
	}
}
