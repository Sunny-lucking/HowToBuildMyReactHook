import React from 'react';
import ReactDOM from 'react-dom';

let lastState
// useReducer原理
function useReducer(reducer,initialState){
    lastState = lastState || initialState
    function dispatch(action){
        lastState = reducer(lastState,action)
        render()
    }
    return [lastState,dispatch]
}

// 官方 useReducer Demo
// 第一个参数：应用的初始化
const initialState = {count: 0};

// 第二个参数：state的reducer处理函数
function reducer(state, action) {
    switch (action.type) {
        case 'increment':
            return {count: state.count + 1};
        case 'decrement':
            return {count: state.count - 1};
        default:
            throw new Error();
    }
}

function Counter() {
    // 返回值：最新的state和dispatch函数
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <>
            {/* // useReducer会根据dispatch的action，返回最终的state，并触发rerender */}
            Count: {state.count}
            {/* // dispatch 用来接收一个 action参数「reducer中的action」，用来触发reducer函数，更新最新的状态 */}
            <button onClick={() => dispatch({type: 'increment'})}>+</button>
            <button onClick={() => dispatch({type: 'decrement'})}>-</button>
        </>
    );
}
function render(){
    ReactDOM.render(
        <Counter />,
        document.getElementById('root')
    );
}
render()
