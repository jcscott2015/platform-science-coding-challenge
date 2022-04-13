# Platform Science SDE Coding Challenge

***Applicant: John C. Scott***

## Installation

In the project directory, install module dependencies:

### `npm install`

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in production mode, from the `dist` folder.

### `npm run dev`

Runs the app in the developer mode.
The page will reload if you make edits.
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `dist` folder.

### `npm test`

Run any tests that exist in the `src` folder.

## Usage

In the project directory, run `npm run build` and then `npm start`.

Two prompts will eventually appear. The first requesting a path to the addresses text file, and the second requesting a path to the drivers text file. Relative or absolute paths are accepted.

Data files for each are supplied in the `data` folder.

## Approach

The challenge is a variation of the [Assignment Problem](https://en.wikipedia.org/wiki/Assignment_problem). The difference being rewards rather than costs are being evaluated. ***The Suitability Score*** is a "reward".

The most popular [Hungarian (Kuhn-Munkres) Algorithm](https://en.wikipedia.org/wiki/Hungarian_algorithm), better explained [here](https://brc2.com/the-algorithm-workshop/), was going to be my solution choice. After some investigating, I found evidence that the Jonker-Volgenant algorithm was markedly faster. The Hungarian Algorithm has a time complexity of O(n<sup>3</sup>), where Jonker-Volgenant has been calculated to O(n<sup>2</sup>). The Jonker-Volgenant algorithm also has fewer and less complicated steps.

The Jonker-Volgenant Linear Assignment Problem code flavors are available mostly in Python, and are based on Roy Jonker's C++ code. One NodeJS variant [exists](https://github.com/Fil/lap-jv). I forked the code and added Typescript support. The original C++ code can be a NodeJS addon, but I preferred a Typescript module instead for this challenge.

Like the Hungarian Algorithm, the Jonker-Volgenant algorithm calculates optimal, or minimal, cost. This article, [Linear Assignment Problem in One Shot Learning Networks](https://medium.com/@rajneeshtiwari_22870/linear-assignment-problem-in-metric-learning-for-computer-vision-eba7d637c5d4), gave me a clue as to how to convert a cost matrix into a rewards matrix. Inverting the reward scores (multiply by ***-1***) and replacing any ***0*** score with a very large number, say 100000, allows the Jonker-Volgenant algorithm to produce a reward solution.

Once the suitability scores are determined and the optimal ones identified, another corresponding matrix containing driver's names and destination addresses is used to match the scores to the driver/destination pair.

As the matrices are padded, unbalanced assignments can be accomodated. Assignments for those simply won't be made. All matices are squares, even if the data rows aren't equal to data columns.

## References

- [A Greedy Approximation Algorithm for the Linear Assignment Problem](https://antimatroid.wordpress.com/2017/03/21/a-greedy-approximation-algorithm-for-the-linear-assignment-problem/)

- [Fast Jonker-Volgenant algorithm](https://medium.com/@rajneeshtiwari_22870/linear-assignment-problem-in-metric-learning-for-computer-vision-eba7d637c5d4)

- [hungarianalgorithm.com](https://www.hungarianalgorithm.com/)

- [Hungarian (Kuhn-Munkres) Algorithm](https://en.wikipedia.org/wiki/Hungarian_algorithm)

- [LAPJV-algorithm-c](https://github.com/yongyanghz/LAPJV-algorithm-c)

- [LAPJV - Jonker-Volgenant Algorithm for Linear Assignment Problem V3.0](https://www.mathworks.com/matlabcentral/fileexchange/26836-lapjv-jonker-volgenant-algorithm-for-linear-assignment-problem-v3-0)

- [Linear Assignment Problem](https://observablehq.com/@fil/lap-jv)

- [Linear Assignment Problem in One Shot Learning Networks](https://medium.com/@rajneeshtiwari_22870/linear-assignment-problem-in-metric-learning-for-computer-vision-eba7d637c5d4)

- [Munkres Assignment Algorithm](https://brc2.com/the-algorithm-workshop/)
