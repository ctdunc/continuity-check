import React, { Component } from 'react';
import io from 'socket.io-client';

export default class StartMetadata extends Component {
	constructor(props,context){
		super(props,context);
		this.renderOpt = this.renderOpt.bind(this);
		console.log(this.props)
	}
	
	renderOpt(opt){
		return(
			<option key={opt} value={opt}>{opt}</option>
			);
	}
	render(){
		return(
			<div>
				<form> 
					<div className="row">
						<label className="col-25">
							Expected Values
						</label>
						<select className="col-75" 
							name="expectedValue" 
							onChange={this.props.callback.bind(this,'expectedValue')}>
							{this.props.options['expected'].map(this.renderOpt)}
						</select>
					</div>

					<div className="row">
						<label className="col-25">
							Institution
						</label>
						<select	name="institution" 
							className='col-75' 
							onChange={this.props.callback.bind(this,'insttitution')}>
							{this.props.options['inst'].map(this.renderOpt)}
						</select>
					</div>

					<div className="row">
						<label className="col-25" >
							Wiring
						</label>
						<select	name="wiring" 
							className='col-75' 
							onChange={this.props.callback.bind(this,'wiring')}>
							{this.props.options['wiring'].map(this.renderOpt)}	
						</select>
					</div>

					<div className="row">
						<label className="col-25">
							VIB
						</label>
						<input name="vib" 
							className='col-75' 
							onChange={this.props.callback.bind(this,'vib')}>
						</input>
					</div>

					<div className="row">
						<label className="col-25">
							Device
						</label>
						<select name="device" 
							className='col-75' 
							onChange={this.props.callback.bind(this,'device')}>
							{this.props.options['device'].map(this.renderOpt)}
						</select>
					</div>
					
					<div className="row">
						<label className="col-25">
							Temperature (Celsius)
						</label>
						<input type="textarea" 
							name="temperature" 
							className='col-75' 
							onChange={this.props.callback.bind(this,'temperature')} >
						</input>
					</div>
				</form>
			</div>
		);
	}
}

