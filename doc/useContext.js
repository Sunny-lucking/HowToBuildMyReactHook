mport React, { useState } from 'react';
import ReactDOM from 'react-dom';
let AppContext = React.createContext()
function useContext(context){
    return context._currentValue
}
function Counter() {
    let { state, setState } = useContext(AppContext)
    return (
        <>
            <button onClick={() => setState({ number: state.number + 1 })}>+</button>
        </>
    );
}
function App() {
    let [state, setState] = useState({ number: 0 })
    return (
        <AppContext.Provider value={{ state, setState }}>
            <div>
                <h1>{state.number}</h1>
                <Counter></Counter>
            </div>
        </AppContext.Provider>
    )
}
function render() {
    ReactDOM.render(
        <App />,
        document.getElementById('root')
    );
}
render()
