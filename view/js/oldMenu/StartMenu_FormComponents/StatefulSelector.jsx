import React, { Component } from 'react';
import { Form, Select, Option } from 'informed';

export default class StatefulSelector extends Component{
	constructor(props){
		super(props);
		this.state = {
			'options': ["a","b","c"],
			'selected': []
		}

		this.arrToOpts = this.arrToOpts.bind(this);
		this.setFormApi = this.setFormApi.bind(this);
	}
	
	setFormApi(formApi){
		this.formApi = formApi;
	}

	arrToOpts(arr){
		return(
			arr.map((el,index) =>
				<Option key={index} value={el}>{el}</Option>
			)
		);
	}
	

	render(){
	}
}
