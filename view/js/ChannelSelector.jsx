import React, { Component } from 'react';

var $ = require('jquery');

export default class ChannelSelector extends Component{
	constructor(props,context){
		super(props,context);
		this.generateChannels = this.generateChannels.bind(this);
		this.initialChannelRender = this.initialChannelRender.bind(this);
	}

	generateChannels(type){
		let t = type['type']
		let c = type['channels']+1
		let clist = [...Array(c).keys()]
		let names = clist.map((x) =>{ return([t+Number(x),x]);});
		let result = names.map(this.initialChannelRender);
		
		return(
			<div key={t} className="selection-column">
				<h2 className="selection-header"> {t} </h2><br/>
				<div key={t} className="selection-row">
					{result}
				</div>
			</div>
		);	
	}

	initialChannelRender(n){
		return(
			<label key={n[0]}> 
				<input type="checkbox" 
					onChange={this.props.callback.bind(this, n[0])}/>
					{n[1]}
			</label>	
		);
	}

	render(){
		return(
			<div className="channel-selector">
				{this.props.layout.map(this.generateChannels)}
			</div>
		);
	}
}
