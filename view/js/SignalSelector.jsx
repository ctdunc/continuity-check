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
			<div key={t} className="selection-row">
				<h2 className="selection-header"> {t} </h2>
				{result}
			</div>
		);
	}	
	
	initialSelectorRender(n){
		return(
			<label key={n}> {n}
				<input type="checkbox" checked={this.props.checked[n]} key={n} onChange={this.props.callback.bind(this, n)}/>
			</label>
			);
	}
	render(){
		return(
		<div className="signal-selector">
			{this.props.signals.map(this.generateSelectors)}
		</div>
		);
		}
}
