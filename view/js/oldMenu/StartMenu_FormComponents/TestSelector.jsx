import React, { Component } from 'react';
import { Form, Select, label } from 'informed';

export default class TestSelector extends Component{
	constructor(props,context){
		super(props,context);
		this.state = {
			tests: [
				{
					'signal-1': 'TES_BIAS',
				 	'signal-2': {'test1','test2'}
				}
				]
		}

	}
	
	
	render(){
		return(
					
		
		);
	}
}

