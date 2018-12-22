import React, { Component } from 'react';
import io from 'socket.io-client';

var $ = require('jquery');
var socket = io.connect('http://' + document.domain + ':' + location.port);

export default class StartMetadata extends Component {
	constructor(props,context){
		super(props,context);
	}

	render(){
		return(
			<div>
				<form> 
					<div className="row">
						<label className="col-25">
							Expected Values
						</label>
						<select className="col-75">
							<option>meme</option>
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
						<input type="select" name="wiring" className='col-75'>
						
						</input>
					</div>

					<div className="row">
						<label className="col-25">
							VIB
						</label>
						<input type="select" name="vib" className='col-75'>
						
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

