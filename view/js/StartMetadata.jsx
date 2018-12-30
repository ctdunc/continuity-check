import React, { Component } from 'react';
import io from 'socket.io-client';

export default class StartMetadata extends Component {
	constructor(props,context){
		super(props,context);
		this.renderOpt = this.renderOpt.bind(this);
	}
	
	renderOpt(opt){
		return(
			<option key={opt} value={opt}>{opt}</option>
			);
	}
	render(){
		return(
			<div className="metadata">
				<form> 
					<div className="row">
						<label className="col-25">
							Expected Values
						</label>
						<select className="col-75" name="expectedValue">
							{this.props.expectedValues.map(this.renderOpt)}
						</select>
					</div>

					<div className="row">
						<label className="col-25">
							Institution
						</label>
						<input type="select" name="institution" className='col-75'>
						</input>
					</div>

					<div className="row">
						<label className="col-25">
							Wiring
						</label>
						<input type="textarea" name="wiring" className='col-75'>
								
						</input>
					</div>

					<div className="row">
						<label className="col-25">
							VIB
						</label>
						<input type="textarea" name="vib" className='col-75'>
						
						</input>
					</div>

					<div className="row">
						<label className="col-25">
							Device
						</label>
						<input type="select" name="device" className='col-75'>
						
						</input>
					</div>
					
					<div className="row">
						<label className="col-25">
							Temperature (Celsius)
						</label>
						<input type="textarea" name="temperature" className='col-75'>
						
						</input>
					</div>
				</form>
			</div>
		);
	}
}

