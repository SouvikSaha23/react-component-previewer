import React from "react";
import ReactDOM from "react-dom";
import App from "/Users/sosah/Documents/Workspace/Experiments/React/my-app/src/App.js";

const rootElement = document.getElementById("ext-view-port");
ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	rootElement
);
