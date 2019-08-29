import React from 'react';
import cars from './cars.json';

interface Cars {
     Miles_per_Gallon: number;
     Horsepower: number;
}

const Tensor = () => {
    function getData() {
        const carsData = cars.json() as Cars[];
        const cleaned = carsData
            .map(car => ({
                mpg: car.Miles_per_Gallon,
                horsepower: car.Horsepower,
            }))
            .filter(car => car.mpg != null && car.horsepower != null);
        console.log(cleaned);
        return cleaned;
    }
    getData();
    return <div>aaaaaaa</div>;
};

export default Tensor;
