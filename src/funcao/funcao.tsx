import React, { useState } from 'react';
import { show } from '@tensorflow/tfjs-vis';
import * as tf from '@tensorflow/tfjs';

const Funcao: React.FC = () => {
    const [xValue, setXValue] = useState(0);
    const [yValue, setYValue] = useState();
    const [result, setResult] = useState();

    const createModel = () => {
        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 2, inputShape: [2] }));
        model.add(tf.layers.dense({ units: 1}));
        return model;
    };

    const trainModel = (model: tf.Sequential) => {
        model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });
        const a = tf.tensor([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]);
        const b = tf.tensor([[2], [4], [6], [8], [10]]);
    
        model.fit(a, b, {
            epochs: 200,
            callbacks: show.fitCallbacks({ name: 'Training Performance' }, ['loss', 'mse'], {
                height: 200,
                callbacks: ['onEpochEnd'],
            }),
        }).then(() => {
            const yValueLearning = model.predict(tf.tensor([xValue, yValue], [1, 2]));
            setResult((yValueLearning as tf.Tensor<tf.Rank.R2>).print());
        });
    };

    const handleRun = () => {
        const model = createModel();
        trainModel(model);
    };

    const handleSetXValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        const x = parseInt(e.target.value, 0);
        if (typeof x === 'number') setXValue(x);
    };

    const handleSetYValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        const y = parseInt(e.target.value, 0);
        if (typeof y === 'number') setYValue(y);
    };

    return (
        <div>
            <input onChange={e => handleSetXValue(e)} />
            <input onChange={e => handleSetYValue(e)} />
            <button type="button" onClick={() => handleRun()}>
                    Calcular
            </button>
            <div>{yValue}</div>
        </div>
    );
};

export default Funcao;
