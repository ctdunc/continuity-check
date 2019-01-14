import React, { Component } from 'react';

var allcheck = false;
export default class Selector extends Component{

	constructor(props,context){
		super(props,context);
		this.ua = this.ua.bind(this);
		this.state={
			disable:false
		}
	}
	ua(e,bool){
		var ret = this.props.allback(e,bool)
		this.setState({
			disable:ret
		});
	}

	render(){
		return(
			<div className='selector'>
				<h2> {this.props.name} </h2>
				<label>Select All
					<input 
						type="checkbox"
						onChange={this.ua.bind(this,this.state.disable)}/>
				</label>
				{this.props.opts.map(opt=>{return(
				<label key={opt}>
					<input type="checkbox" 
						name={this.props.name+'-'+opt} 
						disabled={this.state.disable}
						key={opt}
						onChange={this.props.callback}/>
					{opt}
				</label>
				)})}
			</div>
		);
	}
}


