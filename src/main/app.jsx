import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";

//page components
import MainLayout from "../components/mainLayout/MainLayout";
import Login from "../containers/login/Login";
import Home from "../containers/home/Home";
import MyEvents from "../containers/myEvents/MyEvents";

//import WithAuth from "../components/auth/WithAuth";

class App extends React.Component {
    render() {
        return (
            <Switch>
                <Route exact path="/login" component={Login} />
                {/* Protected routes */}
                <Route
                    exact
                    path="/home"
                    render={props => (
                        <MainLayout {...props}>
                            <Home />
                        </MainLayout>
                    )}
                />
                <Route
                    exact
                    path="/my-events"
                    render={props => (
                        <MainLayout {...props}>
                            <MyEvents />
                        </MainLayout>
                    )}
                />
                {/* When you insert a wrong route you will be automatically redirect to login screen */}

                <Redirect from="/" to="/login" />
            </Switch>
        );
    }
}

export default App;
