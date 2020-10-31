import React ,{useState,memo}from 'react';
import ReactDOM from 'react-dom';
let lastCallback
// eslint-disable-next-line
let lastCallbackDependencies
function useCallback(callback,dependencies){
    if(lastCallbackDependencies){
        let changed = !dependencies.every((item,index)=>{
            return item === lastCallbackDependencies[index]
        })
        if(changed){
            lastCallback = callback
            lastCallbackDependencies = dependencies
        }
    }else{ // 没有传入依赖项

        lastCallback = callback
        lastCallbackDependencies = dependencies
    }
    return lastCallback
}
function Child({data}) {
    console.log("天啊，我怎么被渲染啦，我并不希望啊")
    return (
        <div>child</div>
    )
}
// eslint-disable-next-line
Child = memo(Child)
function App(){
    const [count, setCount] = useState(0);
    // eslint-disable-next-line
    const addClick = useCallback(()=>{console.log("addClick")},[])
    return (
        <div>

            <Child data={123} onClick={addClick}></Child>
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
