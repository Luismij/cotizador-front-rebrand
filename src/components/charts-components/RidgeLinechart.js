import { useEffect, useRef, useState } from 'react';
import useWindowDimensions from 'hooks/useWindowDimensions';
import * as d3 from 'd3';

const RidgelineChart = ({ data, categories, label }) => {
  const svgRef = useRef(null);
  const [cheight, setCHeight] = useState(0);
  const { width } = useWindowDimensions();

  useEffect(() => {
    let svg = d3.select(svgRef.current).select('svg').remove()
    const n = categories.length
    // set dimensions style of the div that contain the graph
    setCHeight(n * 40)
    if ((!categories || categories.length === 0) || (!data || data.length === 0)) return
    // set the dimensions and margins of the graph
    const margin = { top: 50, right: 30, bottom: 100, left: 110 },
      chartWidth = (width < 700 ? width : 700) - margin.left - margin.right,
      chartHeight = (n * 40) - margin.top - margin.bottom;

    // append the svg object to the body of the page
    svg = d3.select(svgRef.current)
      .append("svg")
      .attr("width", chartWidth + margin.left + margin.right)
      .attr("height", chartHeight + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        `translate(${margin.left}, ${margin.top})`);

    // Compute the mean of each group
    let allMeans = []
    for (const i in categories) {
      const currentGroup = categories[i]
      const mean = d3.mean(data, function (d) { return +d[currentGroup] })
      allMeans.push(mean)
    }

    // Create a color scale using these means.
    const myColor = d3.scaleSequential()
      .domain([0, 100])
      .interpolator(d3.interpolateViridis);

    // Add X axis
    const x = d3.scaleLinear()
      .domain([-5, 105])
      .range([0, chartWidth]);
    svg.append("g")
      .attr("class", "xAxis")
      .attr("transform", "translate(0," + chartHeight + ")")
      .call(d3.axisBottom(x).tickValues([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]).tickSize(-chartHeight))
      .select(".domain").remove()

    // Add X axis label:
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", chartWidth)
      .attr("y", chartHeight + 25)
      .text(label);

    // Create a Y scale for densities
    const y = d3.scaleLinear()
      .domain([0, 0.5])
      .range([chartHeight, 0]);

    // Create the Y axis for names
    const yName = d3.scaleBand()
      .domain(categories)
      .range([0, chartHeight])
      .paddingInner(1)
    svg.append("g")
      .call(d3.axisLeft(yName).tickSize(0))
      .select(".domain").remove()

    // Compute kernel density estimation for each column:
    const kde = kernelDensityEstimator(kernelEpanechnikov(5), x.ticks(80)) // increase this 40 for more accurate density.
    let allDensity = []
    for (let i = 0; i < n; i++) {
      const key = categories[i]
      const density = kde(data.map(function (d) { return d[key]; }))
      allDensity.push({ key: key, density: density })
    }

    // Add areas
    svg.selectAll("areas")
      .data(allDensity)
      .join("path")
      .attr("transform", function (d) { return (`translate(0, ${(yName(d.key) - chartHeight)})`) })
      .attr("fill", function (d) {
        const grp = d.key;
        const index = categories.indexOf(grp)
        const value = allMeans[index]
        return myColor(value)
      })
      .datum(function (d) { return (d.density) })
      .attr("opacity", 0.6)
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .attr("d", d3.line()
        .curve(d3.curveBasis)
        .x(function (d) { return x(d[0]); })
        .y(function (d) { return y(d[1]); })
      )

    // This is what I need to compute kernel density estimation
    function kernelDensityEstimator(kernel, X) {
      return function (V) {
        return X.map(function (x) {
          return [x, d3.mean(V, function (v) { return kernel(x - v); })];
        });
      };
    }
    function kernelEpanechnikov(k) {
      return function (v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
      };
    }// eslint-disable-next-line
  }, [data, categories]);

  return (
    <>
      {
        data.length > 0 ?
          <div ref={svgRef} style={{ width: `${width < 500 ? width : 700}`, height: `${cheight}px` }} />
          :
          <h2>No data to display</h2>
      }
    </>
  )
}

export default RidgelineChart
