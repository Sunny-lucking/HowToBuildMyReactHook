import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
let lastState = []
let stateIndex = 0
function useState(initState) {
    lastState[stateIndex] = lastState[stateIndex] || initState;
    const currentIndex = stateIndex
    function setState(newState) {
        lastState[stateIndex] = newState
        render()
    }
    return [lastState[stateIndex++],setState]
}
function App(){
    const [count, setCount] = useState(0);
    const [sum, setSum] = useState(10)
    return (
        <div>
            {count}
            <br/>
            {sum}
            <button
                onClick={() => {
                    setCount(count + 1);
                    setSum(sum+2)
                }}
            >
                增加
            </button>
        </div>
    );
}
function render(){
    ReactDOM.render(
        <App />,
        document.getElementById('root')
    );
}
render()


