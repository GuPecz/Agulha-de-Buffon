const needleLength = 0.25;
const lineWidth = 0.3;
const numPoints = 100;
const numLines = 10;

// Define the distance between the lines
const gridSpacing = 100;

// Define the positions of the lines
const linePositions = new Array(numLines);
const lineSpacing = gridSpacing / numLines;
for (let i = 0; i < numLines; i++) {
  linePositions[i] = i * lineSpacing;
}

function gaussian(mu, sigma) {
  const x = Math.random() * 2 - 1;
  const y = Math.random() * 2 - 1;
  const r = x * x + y * y;
  if (r >= 1 || r === 0) {
    return gaussian(mu, sigma);
  }
  const c = Math.sqrt((-2 * Math.log(r)) / r);
  return mu + sigma * x * c;
}

function generatePoints(numPoints) {
  const x = Array.from({ length: numPoints }, () => Math.random() * gridSpacing);
  const y = Array.from({ length: numPoints }, () => {
    const lineMaxY = Math.max(...linePositions);
    return gaussian(lineMaxY / 2, lineMaxY / 6);
  });
  return { x, y };
}

// Define the function to count how many needles cross the lines
function countCrossings(x, y) {
  const { numCrossings, colors, xs, ys, crossingIndices, nonCrossingIndices } = x.reduce(
    ({ numCrossings, colors, xs, ys, crossingIndices, nonCrossingIndices }, _, i) => {
      const crossing = linePositions.some((lineStart) => {
        const lineEnd = lineStart + needleLength;
        return y[i] >= lineStart && y[i] <= lineEnd;
      });
      if (crossing) {
        colors.push("red");
        numCrossings++;
        crossingIndices.push(i);
      } else {
        colors.push("green");
        nonCrossingIndices.push(i);
      }
      xs.push(x[i], x[i] + (needleLength / 2) * Math.cos(Math.PI * y[i] / gridSpacing));
      ys.push(y[i], y[i] + (needleLength / 2) * Math.sin(Math.PI * y[i] / gridSpacing));
      return { numCrossings, colors, xs, ys, crossingIndices, nonCrossingIndices };
    },
    { numCrossings: 0, colors: [], xs: [], ys: [], crossingIndices: [], nonCrossingIndices: [] }
  );
  // Return the object with the properties numCrossings, colors, xs, and ys
  return { numCrossings, colors, xs, ys, crossingIndices, nonCrossingIndices };
}

// Generate the random points and count how many needles cross the lines
const points = generatePoints(numPoints);
const { numCrossings, colors, xs, ys, crossingIndices, nonCrossingIndices } = countCrossings(points.x, points.y);
const piEstimate = (2 * numPoints * needleLength) / (numCrossings * lineSpacing);

// Define the data for the plot, including the lines
const lineData = linePositions.map((position) => {
  return {
    x: [0, gridSpacing],
    y: [position, position],
    mode: "lines",
    line: { width: lineWidth, color: "rgba(0, 0, 0, 0.7)" },
    type: "scatter"
  };
});

const crossingNeedleData = {
  x: crossingIndices.map(i => xs[i]),
  y: crossingIndices.map(i => ys[i]),
  mode: "lines",
  line: { width: lineWidth, color: "red" },
  type: "scatter",
  marker: {color: colors}
};

const nonCrossingNeedleData = {
  x: nonCrossingIndices.map(i => xs[i]),
  y: nonCrossingIndices.map(i => ys[i]),
  mode: "lines",
  line: { width: lineWidth, color: "green" },
  type: "scatter",
  marker: {color: colors}
};

const data = [...lineData, crossingNeedleData, nonCrossingNeedleData]; // Changed needleData to crossingNeedleData

// Define the layout for the plot
const layout = {
  title: `Estimate of pi: ${piEstimate}`,
  xaxis: { range: [0, gridSpacing] },
  yaxis: { range: [0, gridSpacing] }
};

// Create the plot
Plotly.newPlot("plot", data, layout);
