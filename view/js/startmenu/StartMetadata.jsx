import React, { Component } from 'react';

export default class StartMetadata extends Component {
	constructor(props,context){
		super(props,context);
	}
		
	componentDidMount(){
	}

	render(){
		return(
			<div>
				{Object.entries(this.props.inputs).map(entry => {
					return(
						<SelectOrEnter key={entry[0]} 
							name={entry[0]}
							label={entry[1]}
							options={this.props.options[entry[0]]}
							callback={this.props.callback}
						/>
					);})}
			</div>
		);
	}
}

class SelectOrEnter extends Component{
	constructor(props,context){
		super(props,context);

		//true==select, false==enter
		this.state = {
			display: true
		};
		this.toggleDisplay=this.toggleDisplay.bind(this);
		this.renderOpt=this.renderOpt.bind(this);
	}

	toggleDisplay(){
		var disp = this.state.display;
		this.setState({
			display:!disp
		});
	}

	renderOpt(opt){
		return(
			<option key={opt} value={opt}>{opt}</option>
		);
	}

	render(){
		// remove duplicate values
		var filteredOpts = Array.from(new Set(this.props.options));
		if(this.state.display){
			return(
				<div key={this.props.name} className="row">
					<label className="col-25">
						{this.props.label}
					</label>
					<div className="col-75">
						<select name={this.props.name} 
							onChange={this.props.callback.bind(this, this.props.name)}
							className="extend">
							{filteredOpts.map(this.renderOpt)}
						</select>
						<button name={'switch'+this.props.name} onClick={this.toggleDisplay}>
							+
						</button>
					</div>
				</div>
			);
		}
		else{
			return(
				<div key={this.props.name} className="row">
					<label className="col-25">
						{this.props.label}
					</label>
					<div className="col-75">
						<input name={this.props.name} 
							onChange={this.props.callback.bind(this, this.props.name)}
							className="extend"/>
						<button name={'switch'+this.props.name} onClick={this.toggleDisplay}>
							x	
						</button>
					</div>
				</div>
			);
		}
	}
}
