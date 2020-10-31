import React ,{useState,memo,}from 'react';
import ReactDOM from 'react-dom';
let lastMemo
// eslint-disable-next-line
let lastMemoDependencies
function useMemo(callback,dependencies){
    if(lastMemoDependencies){
        let changed = !dependencies.every((item,index)=>{
            return item === lastMemoDependencies[index]
        })
        if(changed){
            lastMemo = callback()
            lastMemoDependencies = dependencies
        }
    }else{ // 没有传入依赖项
        lastMemo = callback()
        lastMemoDependencies = dependencies
    }
    return lastMemo
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
    const [number, setNumber] = useState(20)
    let data = useMemo(()=> ({number}),[number])
    return (
        <div>

            <Child data={data}></Child>
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
