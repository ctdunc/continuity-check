import React, { Component } from 'react';

import DisplayManager from './DisplayManager';
import ProgressBar from './ProgressBar';


import '../css/App.css';

export default class ContinuityApp extends Component{
	constructor(props,context){
		super(props,context);
		this.state = {show: 'datadisplay'}
	
		this.showStartMenu=this.showStartMenu.bind(this);
		this.showDataDisplay=this.showDataDisplay.bind(this);
	}
	showStartMenu(e){
		this.setState({show: 'startmenu'});
		e.stopPropagation();
	}
	showDataDisplay(e){
		this.setState({show: 'datadisplay'});
		e.stopPropagation();
	}
	render(){
		return(
			<div className="flex-container">
				<div className="header">
					<div className="top-50">
						<button onMouseDown={this.showStartMenu}>Start Check</button>
						<button onMouseDown={this.showDataDisplay}>View Data</button>
					</div>
					<div className="bottom-50">
						<ProgressBar />
					</div>
				</div>
				<div className="display">
					<DisplayManager show={this.state.show}/>
				</div>
			</div>
		);
	}

}

