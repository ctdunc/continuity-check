import React, { Component } from 'react';

export default class SignalSelector extends Component{
	constructor(props,context){
		super(props,context);
		this.generateSelectors = this.generateSelectors.bind(this);
		this.initialSelectorRender = this.initialSelectorRender.bind(this);
	}
	
	generateSelectors(type){
		let t = type['type']
		let signals = type['signals']
		let result = signals.map(this.initialSelectorRender);
		return(
			<div key={t} className="selection-column">
				<h2 className="selection-header"> {t} </h2>
				<div key={t} className="selection-row">
					{result}
				</div>
			</div>
		);
	}	
	
	initialSelectorRender(n){
		return(
			<label key={n}> 
				<input type="checkbox"  key={n} onChange={this.props.callback.bind(this, n)}
				/>
				{n}
			</label>
			);
	}
	render(){
		return(
		<div className="opt">
			{this.props.signals.map(this.generateSelectors)}
		</div>
		);
		}
}
