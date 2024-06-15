export interface ValuesAndProbabilities {
    values: number[];
    probabilities: number[];
}

export function reduceValues({ values, probabilities }: ValuesAndProbabilities, targetCount: number) {
    if (values.length !== probabilities.length || targetCount <= 1 || targetCount >= values.length) {
        throw new Error("Invalid input");
    }

    // Create an array of objects for easy manipulation
    const data = values.map((value, index) => ({ value, probability: probabilities[index] }));

    // Calculate the target average
    const targetAverage = values.reduce((sum, value, index) => sum + value * probabilities[index], 0);

    // Continuously remove the least probable value
    while (data.length > targetCount) {
        // Find the least probable value
        const minProbIndex = data.reduce((minIndex, item, index, array) => {
            return item.probability < array[minIndex].probability ? index : minIndex;
        }, 0);

        // Get the value and probability to redistribute
        const { value, probability } = data[minProbIndex];
        data.splice(minProbIndex, 1);

        // Find the closest value to redistribute the probability
        const closestIndex = data.reduce((closestIndex, item, index) => {
            return Math.abs(item.value - value) < Math.abs(data[closestIndex].value - value) ? index : closestIndex;
        }, 0);

        // Redistribute the probability to the closest value
        data[closestIndex].probability += probability;
    }

    // Extract the values and probabilities
    let reducedValues = data.map((item) => item.value);
    let reducedProbabilities = data.map((item) => item.probability);

    // Ensure the values are integers by rounding
    reducedValues = reducedValues.map(Math.round);

    // Recalculate the average with rounded values
    const roundedAverage = reducedValues.reduce((sum, value, index) => sum + value * reducedProbabilities[index], 0);

    // Adjust probabilities to approach the target average
    const difference = targetAverage - roundedAverage;
    const adjustment = difference / reducedValues.reduce((sum, value) => sum + value, 0);

    reducedProbabilities = reducedProbabilities.map((prob, index) => prob + adjustment * reducedValues[index]);

    // Normalize probabilities to sum to 1
    const probabilitySum = reducedProbabilities.reduce((sum, probability) => sum + probability, 0);
    reducedProbabilities = reducedProbabilities.map((probability) => probability / probabilitySum);

    return { values: reducedValues, probabilities: reducedProbabilities };
}
