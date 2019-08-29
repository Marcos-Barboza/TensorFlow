import { BrowserRouter as Router, Route } from 'react-router-dom';
import React from 'react';
import Tensor from 'src/tensor/teste'


const Root: React.FunctionComponent = () => (
    <Router>
        <Route path="/" component={Tensor} />
    </Router>
);

export default Root;
