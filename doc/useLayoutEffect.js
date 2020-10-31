import React, { useState} from 'react';
import ReactDOM from 'react-dom';
let lastEffectDependencies
function useLayouyEffect(callback,dependencies){
    if(lastEffectDependencies){
        let changed = !dependencies.every((item,index)=>{
            return item === lastEffectDependencies[index]
        })
        if(changed){
            Promise.resolve().then(callback())
            lastEffectDependencies = dependencies
        }
    }else{
        Promise.resolve().then(callback())
        lastEffectDependencies = dependencies
    }
}
function App() {
    let [number, setNumber] = useState(0)
    useLayouyEffect(()=>{
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
