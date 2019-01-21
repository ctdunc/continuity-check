import React, { Component } from "react";
import ProgressBar from './ProgressBar';
import DisplayManager from './DisplayManager'


import "../css/App.css";

export default class ContinuityApp extends Component{
	constructor(props,context){
		super(props,context);
		this.state = {show: "datadisplay"};
		this.show=this.show.bind(this);	

	}
	show(key){
		this.setState({show:key});
	}
	
	render(){
		return(
			<div className="flex-container">
				<div className="header">
					<div className="top-50">
						<button onClick={this.show.bind(this,"startmenu")}>Start Check</button>
						<button onClick={this.show.bind(this,"datadisplay")}>View Data</button>
						<button onClick={this.show.bind(this,"config")}>Configuration</button>
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

