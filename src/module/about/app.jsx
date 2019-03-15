import React,{Component} from 'react';
import Ap from './ap.jsx';
class App extends Component {
	state = {
		num: 1
	}
	componentDidMount(){
		let cb =() =>{
			this.setState({
				num: ++this.state.num
			})
			setTimeout(() => {
				cb();
			}, 1000)
		}
		cb();
	}
	onInputa(e){
		
		this.setState({
			
			num:e.target.value
		})
	}
    render() {

        return (
            <div>
				<p>喜喜呈现出</p>
				<p>{this.state.num}</p>
				<p>===分割=====</p>
				<input/>
				<Ap />
			</div>
        );
    }
}
export default App;


