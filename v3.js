let w = 1400;
let h = 700;
let padding = 40;
let v1_w = 700;
let v1_h = 500;

let svg = d3.select("body").append("svg").attr("width", w).attr("height", h);
let v1 = d3.select("svg").append("g").attr("id", "v1").attr("clip-path", "url(#clip)");
let v2 = d3.select("svg").append("g").attr("id", "v2").attr("clip-path", "url(#clip2)")
  .attr("transform", "translate(" + v1_w + ", 0)");

let curr_stat = 'VISITS';
let curr_level = 'state';
let focus_state = 'none';
let getXDomain = function (data) {
  let minVal = d3.min(data, (d) => getStatVal(d, curr_stat) / d.POPU_EST);
  let maxVal = d3.max(data, (d) => getStatVal(d, curr_stat) / d.POPU_EST);
  return [
    minVal - (maxVal - minVal) * 0.02, 
    maxVal + (maxVal - minVal) * 0.02
  ];
}

let xScale = d3.scaleLinear()
  .domain(getXDomain(PLS_DATA_BY_STATE_2020))
  .range([padding, v1_w - padding]);
let xScale2 = d3.scaleLinear()
  .domain(getXDomain(PLS_DATA_BY_STATE_2020))
  .range([padding, v1_w - padding ]);

let yScale = d3.scaleLinear()
  .domain([0, 102]) // d3.max(Object.values(EDU_DATA_BY_STATE), (d) => d["all"].HS.PERCENT) + 5
  .range([v1_h - padding, padding]);
let yScale2 = d3.scaleLinear()
  .domain([-2, 100])
  .range([v1_h - padding, padding]);

let clip = svg.append("defs").append("svg:clipPath")
  .attr("id", "clip")
  .append("svg:rect")
  .attr("width", v1_w - padding * 1.5)
  .attr("height", v1_h - padding * 2)
  .attr("x", padding)
  .attr("y", padding);
let clip2 = svg.append("defs").append("svg:clipPath")
  .attr("id", "clip2")
  .append("svg:rect")
  .attr("width", v1_w - padding * 1.5)
  .attr("height", v1_h - padding * 2)
  .attr("x", padding)
  .attr("y", padding);

const brush = d3.brush()                       // Add the brush feature using the d3.brush function
  .extent( [ [-10, 0], [v1_w, v1_h + 10] ] )   // initialise the brush area: start at 0,0 and finishes at width, height
  .on("end", (event) => updateChart(event));   // Each time the brush selection changes, trigger 'updateChart' function

v1.append("g")
  .attr("class", "brush")
  .call(brush);

const brush2 = d3.brush()
  .extent( [ [-10, 0], [v1_w, v1_h + 10] ] )
  .on("end", (event) => updateChart2(event));

v2.append("g")
  .attr("class", "brush")
  .call(brush2);

const stateFill = 'rgba(27, 41, 195, 0.9)';
const stateHoverFill = 'rgba(249, 25, 137, 0.9)';
const cntyFill = 'rgba(249, 25, 137, 0.7)';
const selectedFill = 'rgba(20, 35, 190, 0.9)';

// STATE-LEVEL
v1.selectAll("circle.state.young.hs")
  .data(PLS_DATA_BY_STATE_2020)
  .enter()
  .append("circle")
  .attr("clip-path", clip)
  .attr("id", (d) => d.STABR)
  .attr("class", "state young hs")
  .attr("cx", (d) => { return xScale(getStatVal(d, curr_stat) / d.POPU_EST) })
  .attr("cy", (d) => { return yScale(EDU_DATA_BY_STATE[ABBR_STATE_MAP[d.STABR]]["18-24"].HS.PERCENT) })
  .attr("r", 4)
  .attr("fill", stateFill)
  .attr("opacity", 1)
  .style("cursor", "crosshair")
  // .on("mouseover", function (event, d) {
  //   // d3.select(this)
  //   //   .transition()
  //   //   .duration(100)
  //   //   .attr("fill", stateHoverFill)
  //   //   .attr("r", 7);
  //   // displayPointInfo(d, d.STABR, d3.select(this));
  // })
  // .on("mouseout", function () {
  //   // hidePointInfo();
  //   // d3.select(this)
  //   //   .transition()
  //   //   .duration(100)
  //   //   .attr("r", 4)
  //   //   .attr("fill", stateFill);
  // })
  .append("title")
  .text((d) => ABBR_STATE_MAP[d.STABR]);

v2.selectAll("circle.state.young.ba")
  .data(PLS_DATA_BY_STATE_2020)
  .enter()
  .append("circle")
  .attr("clip-path", clip2)
  .attr("id", (d) => d.STABR)
  .attr("class", "state young ba")
  .attr("cx", (d) => { return xScale2(getStatVal(d, curr_stat) / d.POPU_EST) })
  .attr("cy", (d) => { return yScale2(EDU_DATA_BY_STATE[ABBR_STATE_MAP[d.STABR]]["18-24"].BA.PERCENT) })
  .attr("r", 4)
  .attr("fill", stateFill)
  .attr("opacity", 1)
  .style("cursor", "crosshair")
  .append("title")
  .text((d) => ABBR_STATE_MAP[d.STABR]);

v1.selectAll("circle.state.old.hs")
  .data(PLS_DATA_BY_STATE_2020)
  .enter()
  .append("circle")
  .attr("clip-path", clip)
  .attr("id", (d) => d.STABR)
  .attr("class", "state old hs")
  .attr("cx", (d) => { return xScale(getStatVal(d, curr_stat) / d.POPU_EST) })
  .attr("cy", (d) => { return yScale(EDU_DATA_BY_STATE[ABBR_STATE_MAP[d.STABR]]["25+"].HS.PERCENT) })
  .attr("r", 4)
  .attr("fill", cntyFill)
  .attr("opacity", 1)
  .style("cursor", "crosshair")
  // .on("mouseover", function (event, d) {
  //   // d3.select(this)
  //   //   .transition()
  //   //   .duration(100)
  //   //   .attr("fill", stateHoverFill)
  //   //   .attr("r", 7);
  //   // displayPointInfo(d, d.STABR, d3.select(this));
  // })
  // .on("mouseout", function () {
  //   // hidePointInfo();
  //   // d3.select(this)
  //   //   .transition()
  //   //   .duration(100)
  //   //   .attr("r", 4)
  //   //   .attr("fill", stateFill);
  // })
  .append("title")
  .text((d) => ABBR_STATE_MAP[d.STABR]);

v2.selectAll("circle.state.old.ba")
  .data(PLS_DATA_BY_STATE_2020)
  .enter()
  .append("circle")
  .attr("clip-path", clip2)
  .attr("id", (d) => d.STABR)
  .attr("class", "state old ba")
  .attr("cx", (d) => { return xScale2(getStatVal(d, curr_stat) / d.POPU_EST) })
  .attr("cy", (d) => { return yScale2(EDU_DATA_BY_STATE[ABBR_STATE_MAP[d.STABR]]["25+"].BA.PERCENT) })
  .attr("r", 4)
  .attr("fill", cntyFill)
  .attr("opacity", 1)
  .style("cursor", "crosshair")


// COUNTY-LEVEL
v1.selectAll("circle.county.young.hs")
  .data(PLS_DATA_BY_COUNTY_2020)
  .enter()
  .append("circle")
  .attr("clip-path", clip)
  .attr("id", (d) => d.CNTY_KEY)
  .attr("class", (d) => {
    let c = "county young hs hidden ";
    c += d.CNTY_KEY.split('-')[0];
    return c;
  })
  .attr("cx", (d) => { return xScale(getStatVal(d, curr_stat) / d.POPU_EST) })
  .attr("cy", (d) => {
    if (!EDU_DATA_BY_COUNTY[d.CNTY_KEY]) {
      return 10000;
    }
    return yScale(EDU_DATA_BY_COUNTY[d.CNTY_KEY]["18-24"].HS.PERCENT);
  })
  .attr("r", 3)
  .attr("fill", stateFill)
  .attr("opacity", 1)
  .style("cursor", "crosshair")
  // .on("mouseover", function (event, d) {
  //   // d3.select(this)
  //   //   .transition()
  //   //   .duration(100)
  //   //   .attr("fill", stateHoverFill)
  //   //   .attr("r", 7);
  //   // displayPointInfo(d, d.STABR, d3.select(this));
  // })
  // .on("mouseout", function () {
  //   // hidePointInfo();
  //   // d3.select(this)
  //   //   .transition()
  //   //   .duration(100)
  //   //   .attr("r", 4)
  //   //   .attr("fill", stateFill);
  // })
  .append("title")
  .text((d) => d.CNTY_KEY);
v2.selectAll("circle.county.young.ba")
  .data(PLS_DATA_BY_COUNTY_2020)
  .enter()
  .append("circle")
  .attr("clip-path", clip2)
  .attr("id", (d) => d.CNTY_KEY)
  .attr("class", (d) => {
    let c = "county young ba hidden ";
    c += d.CNTY_KEY.split('-')[0];
    return c;
  })
  .attr("cx", (d) => { return xScale2(getStatVal(d, curr_stat) / d.POPU_EST) })
  .attr("cy", (d) => {
    if (!EDU_DATA_BY_COUNTY[d.CNTY_KEY]) {
      return 10000;
    }
    return yScale2(EDU_DATA_BY_COUNTY[d.CNTY_KEY]["18-24"].BA.PERCENT);
  })
  .attr("r", 3)
  .attr("fill", stateFill)
  .attr("opacity", 1)
  .style("cursor", "crosshair")
  .append("title")
  .text((d) => d.CNTY_KEY);

v1.selectAll("circle.county.old.hs")
  .data(PLS_DATA_BY_COUNTY_2020)
  .enter()
  .append("circle")
  .attr("clip-path", clip)
  .attr("id", (d) => d.CNTY_KEY)
  .attr("class", (d) => {
    let c = "county old hs hidden ";
    c += d.CNTY_KEY.split('-')[0];
    return c;
  })
  .attr("cx", (d) => { return xScale(getStatVal(d, curr_stat) / d.POPU_EST) })
  .attr("cy", (d) => {
    if (!EDU_DATA_BY_COUNTY[d.CNTY_KEY]) {
      return 10000;
    }
    return yScale(EDU_DATA_BY_COUNTY[d.CNTY_KEY]["25+"].HS.PERCENT);
  })
  .attr("r", 3)
  .attr("fill", cntyFill)
  .attr("opacity", 1)
  .style("cursor", "crosshair")
  // .on("mouseover", function (event, d) {
  //   // d3.select(this)
  //   //   .transition()
  //   //   .duration(100)
  //   //   .attr("fill", stateHoverFill)
  //   //   .attr("r", 7);
  //   // displayPointInfo(d, d.STABR, d3.select(this));
  // })
  // .on("mouseout", function () {
  //   // hidePointInfo();
  //   // d3.select(this)
  //   //   .transition()
  //   //   .duration(100)
  //   //   .attr("r", 4)
  //   //   .attr("fill", stateFill);
  // })
  .append("title")
  .text((d) => d.CNTY_KEY);

v2.selectAll("circle.county.old.ba")
  .data(PLS_DATA_BY_COUNTY_2020)
  .enter()
  .append("circle")
  .attr("clip-path", clip2)
  .attr("id", (d) => d.CNTY_KEY)
  .attr("class", (d) => {
    let c = "county old ba hidden ";
    c += d.CNTY_KEY.split('-')[0];
    return c;
  })
  .attr("cx", (d) => { return xScale2(getStatVal(d, curr_stat) / d.POPU_EST) })
  .attr("cy", (d) => {
    if (!EDU_DATA_BY_COUNTY[d.CNTY_KEY]) {
      return 10000;
    }
    return yScale2(EDU_DATA_BY_COUNTY[d.CNTY_KEY]["25+"].BA.PERCENT);
  })
  .attr("r", 3)
  .attr("fill", cntyFill)
  .attr("opacity", 1)
  .style("cursor", "crosshair")
  .append("title")
  .text((d) => d.CNTY_KEY);

// v1.selectAll("circle.county")
//   .data(PLS_DATA_BY_COUNTY_2020)
//   .enter()
//   .append("circle")
//   .attr("id", (d) => d.CNTY_KEY)
//   .attr("class", (d) => {
//     let c = "county hidden ";
//     c += d.CNTY_KEY.split('-')[0];
//     return c;
//   })
//   .attr("cx", (d) => { return xScale(d.VISITS / d.POPU_EST) })
//   .attr("cy", (d) => { return yScale(d.POV_PERCENT) })
//   .attr("r", 3)
//   .attr("fill", cntyFill)
//   .attr("opacity", 1)
//   .style("cursor", "crosshair")
//   .on("mouseover", function (event, d) {
//     d3.selectAll("circle.county." + d.CNTY_KEY.split('-')[0])
//       .raise()
//       .transition()
//       .duration(100)
//       .attr("r", 4)
//       .attr("fill", selectedFill);
//     d3.select(this)
//       .transition()
//       .duration(100)
//       .attr("fill", selectedFill)
//       .attr("r", 6);
//     displayPointInfo(d, d.CNTY_KEY, d3.select(this));
//   })
//   .on("mouseout", function (event, d) {
//     const state = d.CNTY_KEY.split('-')[0];
//     d3.selectAll("circle.county." + state)
//       .transition()
//       .attr("r", 3)
//       .attr("fill", () => { return state !== focus_state ? cntyFill : selectedFill });
//     d3.selectAll("circle.county." + focus_state).raise();
//     hidePointInfo();
//   })
//   .on("click", (event, d) => {
//     const state = d.CNTY_KEY.split('-')[0];
//     if (focus_state === state) {
//       focus_state = 'none';
//       d3.selectAll("circle.county")
//         .classed("hidden", false);
//     } else {
//       showOneState(d.CNTY_KEY.split('-')[0])
//     }
//   });
  // .append("title")
  // .text((d) => d.CNTY_KEY);

const xAxis = d3.axisBottom()
  .scale(xScale)
  .ticks(10);
const xAxis2 = d3.axisBottom()
  .scale(xScale2)
  .ticks(10);

const yAxis = d3.axisLeft()
  .scale(yScale)
  .ticks(10);
const yAxis2 = d3.axisLeft()
  .scale(yScale2)
  .ticks(10);

svg.append("g")
  .attr("class", "x axis left")
  .style("font-size", "12px")
  .attr("transform", "translate(0," + (v1_h - padding) + ")")
  .call(xAxis);
svg.append("g")
  .attr("class", "x axis right")
  .style("font-size", "12px")
  .attr("transform", "translate(" + v1_w + "," + (v1_h - padding) + ")")
  .call(xAxis2);

svg.append("g")
  .attr("class", "y axis left")
  .style("font-size", "12px")
  .attr("transform", "translate(" + padding + ", 0)")
  .call(yAxis);
svg.append("g")
  .attr("class", "y axis right")
  .style("font-size", "12px")
  .attr("transform", "translate(" + (padding + v1_w) + ", 0)")
  .call(yAxis2);

svg.append("text")
  .attr("id", "x-axis-label")
  .attr("class", "x axis label left")
  .attr("font-size", "14px")
  .attr("font-family", "sans-serif")
  .attr("x", v1_w / 2)
  .attr("y", v1_h - padding + 40)
  .attr("text-anchor", "middle")
  .text("visits per person");
svg.append("text")
  .attr("id", "x-axis-label-right")
  .attr("class", "x axis label right")
  .attr("font-size", "14px")
  .attr("font-family", "sans-serif")
  .attr("x", v1_w * 1.5)
  .attr("y", v1_h - padding + 40)
  .attr("text-anchor", "middle")
  .text("visits per person");

svg.append("text")
  .attr("class", "y axis label left")
  .attr("text-anchor", "middle")
  .attr("font-family", "sans-serif")
  .attr("font-size", "14px")
  .attr("x", 490)
  .attr("y", h - 30)
  .attr("transform", "rotate(270, " + padding +  ", " + h + ")")
  .text("Percentage");
svg.append("text")
  .attr("class", "y axis label right")
  .attr("text-anchor", "middle")
  .attr("font-family", "sans-serif")
  .attr("font-size", "14px")
  .attr("x", 490 + v1_w)
  .attr("y", h - 30)
  .attr("transform", "rotate(270, " + (padding + v1_w) +  ", " + h + ")")
  .text("Percentage");

function getStatVal(d, statistic) {
  if (statistic === 'OTHMAT' && curr_level === 'county') {
    return d.ELMATS + d.AUDIO + d.VIDEO + d.EBOOK;
  }
  return d[statistic];
}

let hidePointInfo = function() {
  d3.select("#tooltip").classed("hidden", true);
};

let displayPointInfo = function(d, region, circ) {
  const xPos = parseFloat(circ.attr("cx")) + 25;
  const yPos = parseFloat(circ.attr("cy")) + 225;

  let toolt = d3.select("#tooltip").style("top", yPos + "px");;
  toolt.style("left", xPos + "px");

  if (curr_level === 'state') {
    region = ABBR_STATE_MAP[region];
  } else {
    const parsed = region.split('-');
    region = parsed[1] + ", " + parsed[0];
  }
  toolt.select("#tooltipname").text(region);

  toolt.select("#pov").text(d.POV_PERCENT.toFixed(1))
    .style("color", "black");
  toolt.select("#stat")
    .text(() => {
      const val = getStatVal(d, curr_stat) / d.POPU_EST;
      return val < 0.1 ? val.toPrecision(2) : val.toFixed(1) + " " + STAT_UNIT_MAP[curr_stat];
    })
    .style("color", "black");

  d3.select("#tooltip").classed("hidden", false);
}

function roundDecimal(n, place) {
  const pow = Math.pow(10, place);
  return Math.round(pow * n, 1) / pow;
}

let changeStatistic = function (statistic) {
  curr_stat = statistic;
  const data = curr_level === "state" ? PLS_DATA_BY_STATE_2020 : PLS_DATA_BY_COUNTY_2020;
  xScale.domain(getXDomain(data));
  xScale2.domain(getXDomain(data));

  v1.selectAll("circle.hs." + curr_level)
    .transition("repositionHS")
    .attr("cx", (d) => { return xScale(getStatVal(d, statistic) / d.POPU_EST) });
  v2.selectAll("circle.ba." + curr_level)
    .transition("repositionBA")
    .attr("cx", (d) => { return xScale2(getStatVal(d, statistic) / d.POPU_EST) })
  svg.select(".x.axis.left")
    .transition()
    .call(xAxis);
  svg.select(".x.axis.right")
    .transition()
    .call(xAxis2);
}

function showOneState(state) {
  d3.selectAll("circle.county").classed("hidden", true);
  d3.selectAll("circle.county." + state).classed("hidden", false);
  focus_state = state;
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

function getEduStat(level, d) {
  if (level === 'state') {
    return EDU_DATA_BY_STATE[ABBR_STATE_MAP[d.STABR]];
  }
  return EDU_DATA_BY_COUNTY[d.CNTY_KEY];
}

// Referencing https://d3-graph-gallery.com/graph/interactivity_zoom.html#brushingforzoom
// A function that set idleTimeOut to null
var idleTimeout;
function idled() { idleTimeout = null; }
function updateChart(event) {
  extent = event.selection;

    // if no selection, back to initial coordinate; otherwise update x axis domain
    if (!extent) {
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
      xScale.domain(getXDomain(curr_level === "state" ? PLS_DATA_BY_STATE_2020 : PLS_DATA_BY_COUNTY_2020));
      yScale.domain([0, 102]);
    } else {
      xScale.domain([ xScale.invert(extent[0][0]), xScale.invert(extent[1][0]) ]);
      yScale.domain([ yScale.invert(extent[1][1]), yScale.invert(extent[0][1]) ]);
      v1.select(".brush").call(brush.move, null); // remove grey brush area as soon as the selection has been done
    }

    d3.select(".x.axis").transition().duration(1000).call(xAxis);
    d3.select(".y.axis").transition().duration(1000).call(yAxis);
    v1.selectAll("circle." + curr_level + ".hs.young")
      .transition("recalibrateHSyoung")
      .duration(1000)
      .attr("cx", (d) => xScale(getStatVal(d, curr_stat) / d.POPU_EST) )
      .attr("cy", (d) => {
        const data = getEduStat(curr_level, d);
        return data ? yScale(data["18-24"].HS.PERCENT) : 10000;
      });
    v1.selectAll("circle." + curr_level + ".hs.old")
      .transition("recalibrateHSold")
      .duration(1000)
      .attr("cx", (d) => xScale(getStatVal(d, curr_stat) / d.POPU_EST) )
      .attr("cy", (d) => {
        const data = getEduStat(curr_level, d);
        return data ? yScale(data["25+"].HS.PERCENT) : 10000;
      });
}

function updateChart2(event) {
  extent = event.selection;

    // if no selection, back to initial coordinate; otherwise update x axis domain
    if (!extent) {
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
      xScale2.domain(getXDomain(curr_level === "state" ? PLS_DATA_BY_STATE_2020 : PLS_DATA_BY_COUNTY_2020));
      yScale2.domain([-2, 100]);
    } else {
      xScale2.domain([ xScale2.invert(extent[0][0]), xScale2.invert(extent[1][0]) ]);
      yScale2.domain([ yScale2.invert(extent[1][1]), yScale2.invert(extent[0][1]) ]);
      v2.select(".brush").call(brush2.move, null); // remove grey brush area as soon as the selection has been done
    }

    d3.select(".x.axis.right").transition().duration(1000).call(xAxis2);
    d3.select(".y.axis.right").transition().duration(1000).call(yAxis2);
    v2.selectAll("circle." + curr_level + ".ba.young")
      .transition("recalibrateBAyoung")
      .duration(1000)
      .attr("cx", (d) => xScale2(getStatVal(d, curr_stat) / d.POPU_EST) )
      .attr("cy", (d) => {
        const data = getEduStat(curr_level, d);
        return data ? yScale2(data["18-24"].BA.PERCENT) : 10000;
      });
    v2.selectAll("circle." + curr_level + ".ba.old")
      .transition("recalibrateBAold")
      .duration(1000)
      .attr("cx", (d) => xScale2(getStatVal(d, curr_stat) / d.POPU_EST) )
      .attr("cy", (d) => {
        const data = getEduStat(curr_level, d);
        return data ? yScale2(data["25+"].BA.PERCENT) : 10000;
      });
}
