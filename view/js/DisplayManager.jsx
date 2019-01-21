import React, { Component } from "react";
import DataDisplay from "./datadisplay/DataDisplay";
import StartMenu from "./startmenu/StartMenu";
import ConfigMenu from "./configmenu/ConfigMenu";

var $ = require("jquery");
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
		case "config":
			return(<ConfigMenu/>);
			break;
		default:
			return(
				<div>
					<h1>
							How did you even get to this page? Not an option.	
					</h1>
				</div>
			);
		}
	}
}
export default DisplayManager;
