import React from 'react';
import * as tf from '@tensorflow/tfjs'
import { render, show } from '@tensorflow/tfjs-vis'
import cars from 'src/Cars/cars.json';

interface Cars {
     mpg: number | null;
     horsepower: number | null;
}

interface TensorData {
    inputs: tf.Tensor<tf.Rank>;
    labels: tf.Tensor<tf.Rank>;
    inputMax: tf.Tensor<tf.Rank>;
    inputMin: tf.Tensor<tf.Rank>;
    labelMax: tf.Tensor<tf.Rank>;
    labelMin: tf.Tensor<tf.Rank>;
}

const Cars: React.FunctionComponent = () => {

    /** Prepara os dados de entrada  */
    const getData = () => {
        const cleaned: Cars[] = cars
            .map(car => ({
                mpg: car.Miles_per_Gallon,
                horsepower: car.Horsepower,
            }))
            .filter(car => car.mpg != null && car.horsepower != null);
        return cleaned;
    }

    /** Arquitetura do modelo
         Quais funções o modelo executará quando estiver em execução
         Que algoritmo nosso modelo usará para calcular suas respostas  */

    const createModel = () => {
        /** Isso instancia um tf.Modelobjeto. Esse modelo ocorre sequencial 
            porque suas entradas fluem diretamente para sua saída. */
        const model = tf.sequential(); 

        model.add(tf.layers.dense({inputShape: [1], units: 1, useBias: true}));
        model.add(tf.layers.dense({units: 50, activation: 'sigmoid'}));
        model.add(tf.layers.dense({units: 1, useBias: true}));
      
        return model;
    }

    const convertToTensor = (data: Cars[]) => {
        return tf.tidy(() => {    
            tf.util.shuffle(data);
      
            const inputs = data.map(d => d.horsepower as number)
            const labels = data.map(d => d.mpg as number);
      
            const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
            const labelTensor = tf.tensor2d(labels, [labels.length, 1]);
      
            const inputMax = inputTensor.max();
            const inputMin = inputTensor.min();  
            const labelMax = labelTensor.max();
            const labelMin = labelTensor.min();
      
            const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
            const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));
      
            return {
                inputs: normalizedInputs,
                labels: normalizedLabels,
                inputMax,
                inputMin,
                labelMax,
                labelMin,
            }
        });  
    }

    const trainModel = async (model:tf.Sequential, inputs: tf.Tensor<tf.Rank>, labels:tf.Tensor<tf.Rank>) => {
        model.compile({
            optimizer: tf.train.adam(),
            loss: tf.losses.meanSquaredError,
            metrics: ['mse'],
        });
        const batchSize = 32;
        const epochs = 50;
        
        return model.fit(inputs, labels, {
            batchSize,
            epochs,
            shuffle: true,
            callbacks: show.fitCallbacks(
                { name: 'Training Performance' },
                ['loss', 'mse'], 
                { height: 200, callbacks: ['onEpochEnd'] }
            )
        });
    }
   
    const testModel = (model:tf.Sequential, inputData:Cars[], normalizationData:TensorData) => {
        const {inputMax, inputMin, labelMin, labelMax} = normalizationData;  
        
        const [xs, preds] = tf.tidy(() => {
          
            const xs2 = tf.linspace(0, 1, 100);      
            const preds2 = model.predict(xs2.reshape([100, 1]));      
          
            const unNormXs = xs2
                .mul(inputMax.sub(inputMin))
                .add(inputMin);
          
            const unNormPreds = (preds2 as tf.Tensor<tf.Rank>).mul(labelMax.sub(labelMin)).add(labelMin);
          
            return [unNormXs.dataSync(), unNormPreds.dataSync()];
        });
        
       
        const predictedPoints = Array.from(xs).map((val, i) => {
            return {x: val, y: preds[i]}
        });
        
        const originalPoints = inputData.map(d => ({
            x: d.horsepower as number, y: d.mpg as number,
        }));
        
        
        render.scatterplot(
            {name: 'Model Predictions vs Original Data'}, 
            {values: [originalPoints, predictedPoints], series: ['original', 'predicted']}, 
            {
                xLabel: 'Horsepower',
                yLabel: 'MPG',
                height: 300
            }
        );
    }

    const run = async () => {
        const data = getData();
        const values = data.map(d => ({
            x: d.horsepower as number,
            y: d.mpg as number,
        }));
        const model = createModel();  
        show.modelSummary({name: 'Model Summary'}, model);
        const tensorData = convertToTensor(data);
        const {inputs, labels} = tensorData;
        await trainModel(model, inputs, labels);
        testModel(model, data, tensorData);
        return render.scatterplot(
            { name: 'Horsepower v MPG' },
            { values },
            {
                xLabel: 'Horsepower',
                yLabel: 'MPG',
                height: 300,
            },
        ); 
    }

    return <div style={{display: 'flex'}}>{run()}</div>;
};

export default Cars;
