import React, { useState} from 'react';
import ReactDOM from 'react-dom';
let lastEffectDependencies
function useEffect(callback,dependencies){
    if(lastEffectDependencies){
        let changed = !dependencies.every((item,index)=>{
            return item === lastEffectDependencies[index]
        })
        if(changed){
            setTimeout(callback())
            lastEffectDependencies = dependencies
        }
    }else{
        setTimeout(callback())
        lastEffectDependencies = dependencies
    }
}
function App() {
    let [number, setNumber] = useState(0)
    useEffect(()=>{
        console.log(number);
    },[number])
    return (

        <div>
            <h1>{number}</h1>
            <button onClick={() => setNumber(number+1)}>+</button>
        </div>
    )
}
function render() {
    ReactDOM.render(
        <App />,
        document.getElementById('root')
    );
}
render()
