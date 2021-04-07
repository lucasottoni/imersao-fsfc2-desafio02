import React from 'react';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { RoutePage } from './pages/RoutePage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/users" component={RoutePage} />
        <Route path="/" exact={true}  component={RoutePage} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
