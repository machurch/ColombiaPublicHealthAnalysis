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

    console.log("Raw Row Example:", rows[1]);
  
    // ✅ Assign data to global variable
    data = rows.slice(1).map(row => ({
    name: row[municipalityIndex],
    value: parseInt(row[totalCasesIndex]) || 0,
    population: parseInt(row[populationIndex]) || 0
    }));
    // console.log(data)
    drawBubbleChart(data);    
  });


function drawBubbleChart(data) {
    const width = 600, height = 400;

    const svg = d3.select("#bubble-chart")
        .html("") // Clear any existing chart
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("display", "block")
        .style("margin", "auto");

    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.value)])
        .range([3, 20]);

    const simulation = d3.forceSimulation(data)
        .force("x", d3.forceX(width / 2).strength(0.05))
        .force("y", d3.forceY(height / 2).strength(0.05))
        .force("collide", d3.forceCollide(d => radiusScale(d.value) + 2))
        .on("tick", ticked);

    const bubbles = svg.selectAll(".bubble")
        .data(data)
        .enter().append("circle")
        .attr("class", "bubble")
        .attr("r", d => radiusScale(d.value))
        .attr("fill", (d, i) => d3.schemeCategory10[i % 10]);

    // Group for labels and backgrounds
    const labelGroups = svg.selectAll(".label-group")
        .data(data)
        .enter().append("g")
        .attr("class", "label-group")
        .attr("visibility", "hidden"); // Initially hidden

    // Append text labels first
    const labels = labelGroups.append("text")
        .attr("font-size", "12px")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.5em") // Adjust vertical alignment for better positioning

    labels.append("tspan") // Bold municipality name on the first line
        .text(d => d.name)
        .attr("font-weight", "bold")
        .attr("x", 0) // Keep text centered

    labels.append("tspan") // Non-bold total cases on the second line
        .text(d => `Total Dengue Cases: ${d.value.toLocaleString()}`)
        .attr("x", 0) // Align with the first line
        .attr("dy", "1.2em") // Move below the first line
        .attr("font-weight", "normal");

    // Append background rectangles AFTER text so we can calculate text size
    const labelBackgrounds = labelGroups.insert("rect", "text") // Insert rect *before* text
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("rx", 5)  // Rounded corners
        .attr("ry", 5);

    // Adjust background size based on text
    labels.each(function(d, i) {
        const bbox = this.getBBox();  // Get text size
        d3.select(labelBackgrounds.nodes()[i])
            .attr("x", bbox.x - 5)
            .attr("y", bbox.y - 2)
            .attr("width", bbox.width + 10)
            .attr("height", bbox.height + 4);
    });

    // Show/Hide on hover
    bubbles.on("mouseover", function(event, d) {
        d3.select(this).style("opacity", 0.7);
        d3.select(labelGroups.nodes()[data.indexOf(d)]).attr("visibility", "visible");
    }).on("mouseout", function(event, d) {
        d3.select(this).style("opacity", 1);
        d3.select(labelGroups.nodes()[data.indexOf(d)]).attr("visibility", "hidden");
    });

    function ticked() {
        bubbles.attr("cx", d => d.x).attr("cy", d => d.y);
        labelGroups.attr("transform", d => `translate(${d.x},${d.y})`);
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

    

