import React from "react";
import { render } from "react-dom";
import App from "./main/app";
import { BrowserRouter as Router } from "react-router-dom";

import "./assets/less/index.css";

const target = document.getElementById("root");

render(
    <Router>
        <App />
    </Router>,
    target
);
