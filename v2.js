let w = 1400;
let h = 700;
let padding = 40;
let v1_w = 800;
let v1_h = 600;

let svg = d3.select("body").append("svg").attr("width", w).attr("height", h);
let v1 = d3.select("svg").append("g").attr("id", "v1");

let xScale2 = d3.scaleLinear()
  .domain([
    d3.min(PLS_DATA_BY_STATE_2020, (d) => d.VISITS / d.POPU_EST), 
    d3.max(PLS_DATA_BY_STATE_2020, (d) => d.VISITS / d.POPU_EST)
  ])
  .range([padding, v1_w - padding]);

let yScale2 = d3.scaleLinear()
  .domain([
    d3.min(PLS_DATA_BY_STATE_2020, (d) => d.POV_PERCENT), 
    d3.max(PLS_DATA_BY_STATE_2020, (d) => d.POV_PERCENT)
  ])
  .range([v1_h - padding, padding]);

v1.selectAll("circle")
  .data(PLS_DATA_BY_STATE_2020)
  .enter()
  .append("circle")
  .attr("class", (d) => d.STABR)
  .attr("cx", (d) => { return xScale2(d.VISITS / d.POPU_EST) })
  .attr("cy", (d) => { return yScale2(d.POV_PERCENT) })
  .attr("r", 3)
  .attr("stroke", "#444")
  .attr("fill", "blue")
  .attr("opacity", 1)
  .style("cursor", "crosshair")
