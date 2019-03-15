import React from "react";
import ReactDOM from "react-dom";
import App from './app.jsx';
import './index.less';

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
if (module.hot) {
  // accept 函数的第一个参数指出当前文件接受哪些子模块的替换，这里表示只接受 ./AppComponent 这个子模块
  // 第2个参数用于在新的子模块加载完毕后需要执行的逻辑
  module.hot.accept();
}