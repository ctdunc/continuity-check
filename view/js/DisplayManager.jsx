import React, { Component } from 'react';
import DataDisplay from './DataDisplay';
import StartMenu from './StartMenu';

class DisplayManager extends Component{
	constructor(props,context){
		super(props,context);
	}
	render(){
		switch(this.props.show){
			case "startmenu":
				return(<StartMenu/>); 
				break; 
			case "datadisplay": 
				return(<DataDisplay/>);
				break;
			default:
				return(
					<div>
						<h1>
							Invalid Class
						</h1>
					</div>
				);
		}
	}
}
export default DisplayManager;
