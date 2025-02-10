console.log("it's alive!");

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let data = []

fetch("caseData.csv")
  .then(response => response.text())
  .then(csvText => {
    const rows = csvText.split("\n").map(row => row.split(",")); // Convert CSV to array
    const header = rows[0]; // First row as headers
    const municipalityIndex = header.indexOf("Municipality");
    const municipalityCodeIndex = header.indexOf("Municipality code");
    const cases2007Index = header.indexOf("Cases2007");
    const cases2008Index = header.indexOf("Cases2008");
    const cases2009Index = header.indexOf("Cases2009");
    const cases2010Index = header.indexOf("Cases2010");
    const cases2011Index = header.indexOf("Cases2011");
    const cases2012Index = header.indexOf("Cases2012");
    const cases2013Index = header.indexOf("Cases2013");
    const cases2014Index = header.indexOf("Cases2014");
    const cases2015Index = header.indexOf("Cases2015");
    const cases2016Index = header.indexOf("Cases2016");
    const cases2017Index = header.indexOf("Cases2017");
    const cases2018Index = header.indexOf("Cases2018");
    const cases2019Index = header.indexOf("Cases2019");
    const totalCasesIndex = header.indexOf("TotalCases");
    const populationIndex = header.indexOf("Population2019");

    if (municipalityIndex === -1 || totalCasesIndex === -1 || populationIndex === -1) {
        console.error("Missing required columns in CSV");
        return;
      }
  
    // ✅ Assign data to global variable
    data = rows.slice(1).map(row => ({
    name: row[municipalityIndex],
    value: parseInt(row[totalCasesIndex]) || 0,
    population: parseInt(row[populationIndex]) || 0
    }));
    console.log(data)
    drawBubbleChart(data);    
  });


let svg = d3.select('svg');


function drawBubbleChart(data) {
    const width = 600, height = 400;

    // Select the div and create an SVG inside it
    const svg = d3.select("#bubble-chart")
        .html("") // Clear any existing chart
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("display", "block")
        .style("margin", "auto");

    // Create a scale for bubble sizes
    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.value)])
        .range([5, 40]);

    // Create a force simulation
    const simulation = d3.forceSimulation(data)
        .force("x", d3.forceX(width / 2).strength(0.05))
        .force("y", d3.forceY(height / 2).strength(0.05))
        .force("collide", d3.forceCollide(d => radiusScale(d.value) + 2))
        .on("tick", ticked);

    // Create bubbles
    const bubbles = svg.selectAll(".bubble")
        .data(data)
        .enter().append("circle")
        .attr("class", "bubble")
        .attr("r", d => radiusScale(d.value))
        .attr("fill", (d, i) => d3.schemeCategory10[i % 10]);

    // Add labels
    const labels = svg.selectAll(".label")
        .data(data)
        .enter().append("text")
        .attr("class", "label")
        .text(d => `${d.name}: ${d.value.toLocaleString()}`)
        .attr("font-size", "12px")
        .attr("dy", ".35em");

    // Update positions on each tick
    function ticked() {
    bubbles.attr("cx", d => d.x).attr("cy", d => d.y);
    labels.attr("x", d => d.x).attr("y", d => d.y);
    }
    }

function filterByPopulation(minPopulation) {
    const filteredData = data.filter(d => d.population >= minPopulation);
    drawBubbleChart(filteredData);
    }

document.getElementById("population-slider").addEventListener("input", function () {
    const minPopulation = parseInt(this.value);
    document.getElementById("population-value").textContent = minPopulation.toLocaleString();
    filterByPopulation(minPopulation);
    });

    

