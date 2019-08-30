import { BrowserRouter as Router, Route } from 'react-router-dom';
import React from 'react';
import Cars from 'src/Cars/cars'

const Root: React.FunctionComponent = () => (
    <Router>
        <Route path="/" component={Cars} />
    </Router>
);

export default Root;
