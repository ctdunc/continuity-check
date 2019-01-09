import React, { Component } from 'react';


export default class Selector extends Component{

	constructor(props,context){
		super(props,context);
	}
	
	render(){
		return(
			<div className='selector'>
				<h2> {this.props.name} </h2>
				<button onClick={this.props.allback}>Select All</button>
				{this.props.opts.map(opt=>{return(
				<label key={opt}>
					<input type="checkbox" 
						name={this.props.name+'-'+opt} 
						key={opt}
						onChange={this.props.callback}/>
					{opt}
				</label>
					)})}
			</div>
		);
	}
}


