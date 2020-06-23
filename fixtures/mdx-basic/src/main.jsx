import React from "react";
import ReactDOM from "react-dom";
// import App from "./App";
import Doc from "./Doc.mdx";

ReactDOM.render(
  <React.StrictMode>
    {/* <App /> */}
    {/* Doc is self-accepting */}
    <Doc />
  </React.StrictMode>,
  document.getElementById("root")
);
