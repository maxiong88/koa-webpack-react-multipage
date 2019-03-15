import React from "react";
import ReactDOM from "react-dom";
import App from './app.jsx';
import './index.less';

ReactDOM.render(
    <App />,
    document.getElementById('root')
);

if (module.hot) {
  module.hot.accept()
}