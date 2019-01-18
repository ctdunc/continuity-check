import React, { Component } from 'react';
import io from 'socket.io-client';

const selectinputs = {'expected':'Expected Values', 'institution':'Institution', 'wiring':'Wiring', 'vib':'VIB', 'device':'Device', 'channel_naming':'Channel Naming'}

export default class StartMetadata extends Component {
	constructor(props,context){
		super(props,context);
		this.renderOpt = this.renderOpt.bind(this);
		this.renderSelect = this.renderSelect.bind(this);
	}

	renderOpt(opt){
		return(
			<option key={opt} value={opt}>{opt}</option>
			);
	}
	renderSelect(row){
		var label = row[1]
		var key = row[0]
		let opts = this.props.options[key]
		let result = ['no available options']
		if(opts!=null){
			result = opts.map(this.renderOpt)
		}
		return(
			<div key={key} className="row">
				<label className="col-25">
					{label}
				</label>
				<select name={key} className="col-75" onChange={this.props.callback.bind(this, key)} >
					{result}
				</select>
			</div>
			);
	}
	render(){
		return(
			<div>
				{Object.entries(selectinputs).map(this.renderSelect)}
			</div>
		);
	}
}

