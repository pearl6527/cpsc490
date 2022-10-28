let w = 1400;
let h = 700;
let padding = 40;
let v1_w = 800;
let v1_h = 500;

let svg = d3.select("body").append("svg").attr("width", w).attr("height", h);
let v1 = d3.select("svg").append("g").attr("id", "v1");

let curr_stat = 'VISITS';
let curr_level = 'state';
let minVal = d3.min(PLS_DATA_BY_STATE_2020, (d) => d[curr_stat] / d.POPU_EST);
let maxVal = d3.max(PLS_DATA_BY_STATE_2020, (d) => d[curr_stat] / d.POPU_EST);
let xScale = d3.scaleLinear()
  .domain([
    minVal - (maxVal - minVal) * 0.02, 
    maxVal + (maxVal - minVal) * 0.02
  ])
  .range([padding, v1_w - padding]);

let yScale = d3.scaleLinear()
  .domain([
    0,// d3.min(PLS_DATA_BY_STATE_2020, (d) => d.POV_PERCENT) - 1,
    d3.max(PLS_DATA_BY_STATE_2020, (d) => d.POV_PERCENT) + 1
  ])
  .range([v1_h - padding, padding]);

// Based on http://jsfiddle.net/colin_young/VvAaQ/4/
// var downx = Math.NaN;
// var downscalex;
// function dragX(event) {
//     var p = d3.pointer(event);
//     downx = xScale.invert(p[0]);
//     downscalex = xScale;
// };

v1.selectAll("circle.state")
  .data(PLS_DATA_BY_STATE_2020)
  .enter()
  .append("circle")
  .attr("id", (d) => d.STABR)
  .attr("class", "state")
  .attr("cx", (d) => { return xScale(d.VISITS / d.POPU_EST) })
  .attr("cy", (d) => { return yScale(d.POV_PERCENT) })
  .attr("r", 3)
  .attr("stroke", "#444")
  .attr("fill", "blue")
  .attr("opacity", 1)
  .style("cursor", "crosshair")
  .append("title")
  .text((d) => ABBR_STATE_MAP[d.STABR]);

v1.selectAll("circle.county")
  .data(PLS_DATA_BY_COUNTY_2020)
  .enter()
  .append("circle")
  .attr("id", (d) => d.CNTY_KEY)
  .attr("class", (d) => {
    let c = "county hidden ";
    c += d.CNTY_KEY.split('-')[0];
    return c;
  })
  .attr("cx", (d) => { return xScale(d.VISITS / d.POPU_EST) })
  .attr("cy", (d) => { return yScale(d.POV_PERCENT) })
  .attr("r", 2.5)
  .attr("stroke", "red")
  .attr("fill", "red")
  .attr("opacity", 1)
  .style("cursor", "crosshair")
  .on("mouseover", (event, d) => {
    d3.selectAll("circle.county." + d.CNTY_KEY.split('-')[0])
      .raise()
      .transition()
      .duration(100)
      .attr("stroke", "black")
      .attr("r", 3.5)
      .attr("fill", "purple");
  })
  .on("mouseout", (event, d) => {
    d3.selectAll("circle.county." + d.CNTY_KEY.split('-')[0])
      .transition()
      .attr("stroke", "red")
      .attr("r", 2.5)
      .attr("fill", "red");
  })
  .append("title")
  .text((d) => d.CNTY_KEY);

const xAxis = d3.axisBottom()
  .scale(xScale)
  .ticks(10);

const yAxis = d3.axisLeft()
  .scale(yScale)
  .ticks(10);

v1.append("g")
  .attr("class", "x axis rescalable")
  .style("font-size", "12px")
  .attr("transform", "translate(0," + (v1_h - padding) + ")")
  .call(xAxis)
  // .on("mousedown", function (event) {
  //   dragX(event);
  // });
// svg.select('.x.axis text')
//   .on("mousedown", function (event) {
//   dragX(event);
// });
  v1.append("g")
  .attr("class", "y axis")
  .style("font-size", "12px")
  .attr("transform", "translate(" + padding + ", 0)")
  .call(yAxis);
// d3.select('#v1')
//   .on("mousemove", function (event, d) {
//     if (!isNaN(downx)) {
//         var p = d3.pointer(event);
//         var rupx = p[0];
//         if (rupx != 0) {
//             xScale.domain([downscalex.domain()[0], v1_w * (downx - downscalex.domain()[0]) / rupx + downscalex.domain()[0]]);
//         }
//         svg.select('.x.axis').call(xAxis);
//     }
//     d3.selectAll("circle." + curr_level)
//       .transition()
//       .duration(200)
//       .attr("cx", (d) => xScale(getStatVal(d, curr_stat) / d.POPU_EST))
//       .attr("opacity", (d) => {
//         return xScale(getStatVal(d, curr_stat) / d.POPU_EST) > v1_w - padding ? 0 : 1;
//       });

//   })
//   .on("mouseup", function (event, d) {
//     downx = Math.NaN;
//   });
v1.append("text")
  .attr("id", "x-axis-label")
  .attr("class", "x axis label")
  .attr("font-size", "14px")
  .attr("font-family", "sans-serif")
  .attr("x", v1_w / 2)
  .attr("y", v1_h - padding + 40)
  .attr("text-anchor", "middle")
  .text("visits per person");

let getStatVal = function (d, statistic) {
  if (statistic === 'OTHMAT' && curr_level === 'county') {
    return d.ELMATS + d.AUDIO + d.VIDEO + d.EBOOK;
  }
  return d[statistic];
}
let changeStatistic = function (statistic) {
  const data = curr_level === "state" ? PLS_DATA_BY_STATE_2020 : PLS_DATA_BY_COUNTY_2020;
  let minVal = d3.min(data, (d) => getStatVal(d, statistic) / d.POPU_EST);
  let maxVal = d3.max(data, (d) => getStatVal(d, statistic) / d.POPU_EST);
  xScale.domain([
    minVal - (maxVal - minVal) * 0.02, 
    maxVal + (maxVal - minVal) * 0.02
  ]);
  yScale.domain([0, d3.max(data, (d) => d.POV_PERCENT) + 1])

  v1.selectAll("circle." + curr_level)
    .transition()
    .attr("cx", (d) => { return xScale(getStatVal(d, statistic) / d.POPU_EST) })
    .attr("cy", (d) => { return yScale(d.POV_PERCENT) });
  v1.select(".x.axis")
    .transition()
    .call(xAxis);
  v1.select(".y.axis")
    .transition()
    .call(yAxis);
  curr_stat = statistic;
}

let toggleLevels = function (level) {
  d3.selectAll("circle." + (level === "state" ? "county" : "state")).classed("hidden", true);
  d3.selectAll("circle." + level).classed("hidden", false);
  changeStatistic(curr_stat);
}

d3.selectAll("input.stateCountyToggle").on("click", function () {
  curr_level = d3.select(this).node().value;
  toggleLevels(curr_level);
});

