# React Hook原理
@[toc]
## 基本准备工作
利用 **creact-react-app** 创建一个项目
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201031145322925.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80Mzk2NDE0OA==,size_16,color_FFFFFF,t_70#pic_center)

> 已经把项目放到 github：https://github.com/Sunny-lucking/howToBuildMyWebpack。 可以卑微地要个star吗

## 手写useState
### useState的使用

useState可以在函数组件中，添加state Hook。

调用useState会返回一个state变量，以及更新state变量的方法。useState的参数是state变量的初始值，**初始值仅在初次渲染时有效**。


**更新state变量的方法，并不会像this.setState一样，合并state。而是替换state变量。**
下面是一个简单的例子, 会在页面上渲染count的值，点击setCount的按钮会更新count的值。


```js
function App(){
    const [count, setCount] = useState(0);
    return (
        <div>
            {count}
            <button
                onClick={() => {
                    setCount(count + 1);
                }}
            >
                增加
            </button>
        </div>
    );
}
ReactDOM.render(
    <App />,
  document.getElementById('root')
);
```
### 原理实现


```js
let lastState
function useState(initState) {
    lastState = lastState || initState;
    function setState(newState) {
        lastState = newState
    }
    return [lastState,setState]
}
function App(){
    //。。。
}
ReactDOM.render(
    <App />,
  document.getElementById('root')
);
```
如代码所示，我们自己创建了一个useState方法

当我们使用这个方法时，如果是第一次使用，则取initState的值，否则就取上一次的值（laststate）.

在内部，我们创建了一个setState方法，该方法用于更新state的值

然后返回一个lastSate属性和setState方法。

看似完美，但是我们其实忽略了一个问题：每次执行玩setState都应该重新渲染当前组件的。

所以我们需要在setState里面执行刷新操作


```js
let lastState
function useState(initState) {
    lastState = lastState || initState;
    function setState(newState) {
        lastState = newState
        render()
    }
    return [lastState,setState]
}
function App(){
    const [count, setCount] = useState(0);
    return (
        <div>
            {count}
            <button
                onClick={() => {
                    setCount(count + 1);
                }}
            >
                增加
            </button>
        </div>
    );
}
// 新增方法
function render(){
    ReactDOM.render(
        <App />,
        document.getElementById('root')
    );
}
render()
```

如代码所示，我们在setState里添加了个render方法。
render方法则会执行


```js
ReactDOM.render(
        <App />,
        document.getElementById('root')
    );
```
也就是重新渲染啦。

好了，现在是不是已经完整了呢？

不，还有个问题：就说我们这里只是用了一个useState，要是我们使用了很多个呢？难道要声明很多个全局变量吗？

这显然是不行的，所以，我们可以设计一个全局数组来保存这些state


```js
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
```

这里的currentIndex是利用了闭包的思想，将某个state相应的index记录下来了。

好了，useState方法就到这里基本完成了。是不是so easy！！！

## React.memo介绍

看下面的代码！你发现什么问题？

```js
import React ,{useState}from 'react';
import ReactDOM from 'react-dom';
import './index.css';
function Child({data}) {
    console.log("天啊，我怎么被渲染啦，我并不希望啊")
    return (
        <div>child</div>
    )
}
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
```
没错，就是尽管我们传个子组件的props是固定的值，当父组件的数据更改时，子组件也被重新渲染了，我们是希望当传给子组件的props改变时，才重新渲染子组件。

所以引入了React.memo。

**看看介绍**

React.memo() 和 PureComponent 很相似，它帮助我们控制何时重新渲染组件。

组件仅在它的 props 发生改变的时候进行重新渲染。通常来说，在组件树中 React 组件，只要有变化就会走一遍渲染流程。但是通过 PureComponent 和 React.memo()，我们可以仅仅让某些组件进行渲染。

```js

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

```


因此，当Child被memo包装后，就只会当props改变时才会重新渲染了。

当然，由于React.memo并不是react-hook的内容，所以这里并不会取讨论它是怎么实现的。

## 手写useCallback
### useCallback的使用
当我们试图给一个子组件传递一个方法的时候，如下代码所示


```javascript

import React ,{useState,memo}from 'react';
import ReactDOM from 'react-dom';
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
    const addClick = ()=>{console.log("addClick")}
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
```
发现我们传了一个addClick方法 是固定的，但是却每一次点击按钮子组件都会重新渲染。

这是因为你看似addClick方法没改变，其实旧的和新的addClick是不一样的，如图所示

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201019102340105.png#pic_center)


这时，如果想要，传入的都是同一个方法，就要用到useCallBack。

如代码所示

```javascript
import React ,{useState,memo,useCallback}from 'react';
import ReactDOM from 'react-dom';
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

```
useCallback钩子的第一个参数是我们要传递给子组件的方法，第二个参数是一个数组，用于监听数组里的元素变化的时候，才会返回一个新的方法。

### 原理实现

我们知道useCallback有两个参数，所以可以先写

```javascript
function useCallback(callback,lastCallbackDependencies){
    
    
}
```
跟useState一样，我们同样需要用全局变量把callback和dependencies保存下来。

```javascript
let lastCallback
let lastCallbackDependencies
function useCallback(callback,dependencies){
   
}
```

首先useCallback会判断我们是否传入了依赖项，如果没有传的话，说明要每一次执行useCallback都返回最新的callback


```javascript
let lastCallback
let lastCallbackDependencies
function useCallback(callback,dependencies){
    if(lastCallbackDependencies){

    }else{ // 没有传入依赖项
        

    }
    return lastCallback
}
```



所以当我们没有传入依赖项的时候，实际上可以把它当作第一次执行，因此，要把lastCallback和lastCallbackDependencies重新赋值

```javascript
let lastCallback
let lastCallbackDependencies
function useCallback(callback,dependencies){
    if(lastCallbackDependencies){

    }else{ // 没有传入依赖项
        
        lastCallback = callback
        lastCallbackDependencies = dependencies
    }
    return lastCallback
}
```
当有传入依赖项的时候，需要看看新的依赖数组的每一项和来的依赖数组的每一项的值是否相等

```javascript
let lastCallback
let lastCallbackDependencies
function useCallback(callback,dependencies){
    if(lastCallbackDependencies){
        let changed = !dependencies.every((item,index)=>{
            return item === lastCallbackDependencies[index]
        })
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
```
当依赖项有值改变的时候，我们需要对lastCallback和lastCallbackDependencies重新赋值

```javascript
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

```

## 手写useMemo
### 使用
useMemo和useCallback类似，不过useCallback用于缓存函数，而useMemo用于缓存函数返回值

```javascript
let data = useMemo(()=> ({number}),[number])
```
如代码所示，利用useMemo用于缓存函数的返回值number，并且当只有监听元素为[number]，也就是说，当number的值发生改变的时候，才会重新执行

```javascript
()=> ({number})
```
然后返回新的number
### 原理
所以，useMemo的原理跟useCallback的差不多，仿写即可。
```javascript
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
```

## 手写useReducer
### 使用
先简单介绍下useReducer。

```javascript
const [state, dispatch] = useReducer(reducer, initState);
```
**useReducer接收两个参数：**

第一个参数：reducer函数，第二个参数：初始化的state。

返回值为最新的state和dispatch函数（用来触发reducer函数，计算对应的state）。

按照官方的说法：对于复杂的state操作逻辑，嵌套的state的对象，推荐使用useReducer。

听起来比较抽象，我们先看一个简单的例子：

```javascript
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
            // useReducer会根据dispatch的action，返回最终的state，并触发rerender
            Count: {state.count}
            // dispatch 用来接收一个 action参数「reducer中的action」，用来触发reducer函数，更新最新的状态
            <button onClick={() => dispatch({type: 'increment'})}>+</button>
            <button onClick={() => dispatch({type: 'decrement'})}>-</button>
        </>
    );
}
```
其实意思可以简单的理解为，当state是基本数据类型的时候，可以用useState，当state是对象的时候，可以用reducer，当然这只是一种简单的想法。大家不必引以为意。具体情况视具体场景分析。

### 原理
看原理你会发现十分简单，简单到不用我说什么，不到十行代码，不信你直接看代码

```javascript
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
```

## 手写useContext
### 使用
createContext 能够创建一个 React 的 上下文（context），然后订阅了这个上下文的组件中，可以拿到上下文中提供的数据或者其他信息。

基本的使用方法：

```javascript
const MyContext = React.createContext()
```
如果要使用创建的上下文，需要通过 Context.Provider 最外层包装组件，并且需要显示的通过 `<MyContext.Provider value={{xx:xx}}>` 的方式传入 value，指定 context 要对外暴露的信息。

子组件在匹配过程中只会匹配最新的 Provider，也就是说如果有下面三个组件：`ContextA.Provider->A->ContexB.Provider->B->C`

如果 ContextA 和 ContextB 提供了相同的方法，则 C 组件只会选择 ContextB 提供的方法。

通过 React.createContext 创建出来的上下文，在子组件中可以通过 useContext 这个 Hook 获取 Provider 提供的内容

```javascript
const {funcName} = useContext(MyContext);
```

从上面代码可以发现，useContext 需要将 MyContext 这个 Context 实例传入，不是字符串，就是实例本身。

这种用法会存在一个比较尴尬的地方，父子组件不在一个目录中，如何共享 MyContext 这个 Context 实例呢？

一般这种情况下，我会通过 Context Manager 统一管理上下文的实例，然后通过 export 将实例导出，在子组件中在将实例 import 进来。

下面我们看看代码，使用起来非常简单

```javascript
import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom';
let AppContext = React.createContext()
function Counter() {
    let { state, setState } = useContext(AppContext)
    return (
        <>
            Count: {state.count}

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
```
要是用过vue的同学，会发现，这个机制有点类似vue 中提供的provide和inject

### 原理
原理非常简单，由于createContext，Provider 不是ReactHook的内容，
所以这里值需要实现useContext，如代码所示，只需要一行代码

```javascript
import React, { useState } from 'react';
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
```
## 手写useEffect
### 使用
它跟class组件中的componentDidMount，componentDidUpdate，componentWillUnmount具有相同的用途，只不过被合成了一个api。

```javascript
import React, { useState, useEffect} from 'react';
import ReactDOM from 'react-dom';

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
```
如代码所示，支持两个参数，第二个参数也是用于监听的。
当监听数组中的元素有变化的时候再执行作为第一个参数的执行函数

### 原理

原理发现其实和useMemo，useCallback类似，只不过，前面前两个有返回值，而useEffect没有。（当然也有返回值，就是那个执行componentWillUnmount函功能的时候写的返回值，但是这里返回值跟前两个作用不一样，因为你不会写

```javascript
let xxx = useEffect(()=>{
        console.log(number);
    },[number])
```
来接收返回值。

所以，忽略返回值，你可以直接看代码，真的很类似，简直可以用一模一样来形容

```javascript
import React, { useState} from 'react';
import ReactDOM from 'react-dom';
let lastEffectDependencies
function useEffect(callback,dependencies){
    if(lastEffectDependencies){
        let changed = !dependencies.every((item,index)=>{
            return item === lastEffectDependencies[index]
        })
        if(changed){
            callback()
            lastEffectDependencies = dependencies
        }
    }else{ 
        callback()
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
```

你以为这样就结束了，其实还没有，因为第一个参数的执行时机错了，实际上作为第一个参数的函数因为是在**浏览器渲染结束后执行**的。而这里我们是同步执行的。

所以需要改成异步执行callback

```javascript
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
```

## 手写useLayoutEffect
### 使用
官方解释，这两个hook基本相同，调用时机不同，请全部使用useEffect，除非遇到bug或者不可解决的问题，再考虑使用useLayoutEffect。
### 原理
原理跟useEffect一样，只是调用时机不同

上面说到useEffect的调用时机是**浏览器渲染结束后执行**的，而useLayoutEffect是在**DOM构建完成，浏览器渲染前执行**的。

所以这里需要把宏任务setTimeout改成微任务

```javascript
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
```
> 恭喜你阅读到这里，又变强了有没有
> 已经把项目放到 github：https://github.com/Sunny-lucking/howToBuildMyWebpack。 顺便可以卑微地要个star吗

> 文章首发于公众号《前端阳光》
