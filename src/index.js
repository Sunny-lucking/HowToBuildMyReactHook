import React ,{useState,memo}from 'react';
import ReactDOM from 'react-dom';
import './index.css';
function Child({data}) {
    console.log("天啊，我怎么被渲染啦，我并不希望啊")
    return (
        <div>child</div>
    )
}
Child = memo(Child)
function App(){
    const [count, setCount] = useState(0);
    return (
        <div>
            <Child data={123}></Child>
            <button onClick={() => { setCount(count + 1)}}>
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


