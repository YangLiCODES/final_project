import React from "react";
import "./App.css";
import Events from "./Components/Events";
import EventDetail from "./Components/EventDetail";
import Create from "./Components/Create";
import { HashRouter as Router, Switch, Route, Link } from "react-router-dom";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5000";
function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/">
            <Events />
          </Route>
          <Route path="/create">
            <Create />
          </Route>
          <Route path="/event/:eventName">
            <EventDetail />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
