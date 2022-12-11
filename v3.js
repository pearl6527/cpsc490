let w = 1400;
let h = 700;
let padding = 40;
let v1_w = 675;
let v1_h = 475;

let svg = d3.select("body").append("svg").attr("width", w).attr("height", h).attr("transform", "translate(20, 40)");
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

let yScaleDomain = [40, 102];
let yScale2Domain = [-2, 95];
let yScale = d3.scaleLinear()
  .domain(yScaleDomain) // d3.max(Object.values(EDU_DATA_BY_STATE), (d) => d["all"].HS.PERCENT) + 5
  .range([v1_h - padding, padding]);
let yScale2 = d3.scaleLinear()
  .domain(yScale2Domain)
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

const brush = d3.brush()                       // add the brush feature using the d3.brush function
  .extent( [ [-10, 0], [v1_w, v1_h + 10] ] )   // initialise the brush area: start at 0,0 and finishes at width, height
  .on("end", (event) => updateChart(event));   // each time the brush selection changes, trigger 'updateChart' function

v1.append("g")
  .attr("class", "brush")
  .call(brush);

const brush2 = d3.brush()
  .extent( [ [-10, 0], [v1_w, v1_h + 10] ] )
  .on("end", (event) => updateChart2(event));

v2.append("g")
  .attr("class", "brush")
  .call(brush2);

let showYoung = true;
let showOld = true;

const youngFill = 'rgba(117, 191, 65, 0.7)';
const youngSelectedFill = 'rgba(15, 128, 5, 0.9)';
const oldFill = 'rgba(239, 114, 54, 0.7)';
const oldSelectedFill = 'rgba(166, 43, 14, 0.9)';
const selectedOutline = '#555';
const hoverRadius = 5.5;
const rState = 4;
const rCounty = 3;
const youngOutline = 'rgb(89, 155, 11)';
const oldOutline = 'rgb(206, 68, 11)';

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
  .attr("r", rState)
  .attr("fill", youngFill)
  .attr("opacity", 1)
  .attr("stroke-width", 0)
  .attr("stroke", selectedOutline)
  .style("cursor", "crosshair")
  .on("mouseover", function (event, d) {
    displayPointInfoState(d, "18-24", "HS", d3.select(this));
  })
  .on("mouseout", function () {
    hidePointInfo(d3.select(this), youngFill, rState);
  });

v2.selectAll("circle.state.young.ba")
  .data(PLS_DATA_BY_STATE_2020)
  .enter()
  .append("circle")
  .attr("clip-path", clip2)
  .attr("id", (d) => d.STABR)
  .attr("class", "state young ba")
  .attr("cx", (d) => { return xScale2(getStatVal(d, curr_stat) / d.POPU_EST) })
  .attr("cy", (d) => { return yScale2(EDU_DATA_BY_STATE[ABBR_STATE_MAP[d.STABR]]["18-24"].BA.PERCENT) })
  .attr("r", rState)
  .attr("fill", youngFill)
  .attr("stroke-width", 0)
  .attr("stroke", selectedOutline)
  .attr("opacity", 1)
  .style("cursor", "crosshair")
  .on("mouseover", function (event, d) {
    displayPointInfoState(d, "18-24", "BA", d3.select(this), v1_w);
  })
  .on("mouseout", function () {
    hidePointInfo(d3.select(this), youngFill, rState);
  });

v1.selectAll("circle.state.old.hs")
  .data(PLS_DATA_BY_STATE_2020)
  .enter()
  .append("circle")
  .attr("clip-path", clip)
  .attr("id", (d) => d.STABR)
  .attr("class", "state old hs")
  .attr("cx", (d) => { return xScale(getStatVal(d, curr_stat) / d.POPU_EST) })
  .attr("cy", (d) => { return yScale(EDU_DATA_BY_STATE[ABBR_STATE_MAP[d.STABR]]["25+"].HS.PERCENT) })
  .attr("r", rState)
  .attr("fill", oldFill)
  .attr("stroke-width", 0)
  .attr("stroke", selectedOutline)
  .attr("opacity", 1)
  .style("cursor", "crosshair")
  .on("mouseover", function (event, d) {
    displayPointInfoState(d, "25+", "HS", d3.select(this));
  })
  .on("mouseout", function () {
    hidePointInfo(d3.select(this), oldFill, rState);
  });

v2.selectAll("circle.state.old.ba")
  .data(PLS_DATA_BY_STATE_2020)
  .enter()
  .append("circle")
  .attr("clip-path", clip2)
  .attr("id", (d) => d.STABR)
  .attr("class", "state old ba")
  .attr("cx", (d) => { return xScale2(getStatVal(d, curr_stat) / d.POPU_EST) })
  .attr("cy", (d) => { return yScale2(EDU_DATA_BY_STATE[ABBR_STATE_MAP[d.STABR]]["25+"].BA.PERCENT) })
  .attr("r", rState)
  .attr("fill", oldFill)
  .attr("stroke-width", 0)
  .attr("stroke", selectedOutline)
  .attr("opacity", 1)
  .style("cursor", "crosshair")
  .on("mouseover", function (event, d) {
    displayPointInfoState(d, "25+", "BA", d3.select(this), v1_w);
  })
  .on("mouseout", function () {
    hidePointInfo(d3.select(this), oldFill, rState);
  });


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
  .attr("r", rCounty)
  .attr("fill", youngFill)
  .attr("stroke-width", 0)
  .attr("stroke", selectedOutline)
  .attr("opacity", 1)
  .style("cursor", "crosshair")
  .on("mouseover", function (event, d) {
    selectSameState(d, "circle.county.young.hs.", youngSelectedFill);
    displayPointInfoCounty(d, "18-24", "HS", d3.select(this));
  })
  .on("mouseout", function (event, d) {
    deselectSameState(d, "circle.county.young.hs.", youngFill);
    hidePointInfo(d3.select(this), youngFill, rCounty);
  })
  .on("click", (event, d) => {
    onClickCounty(d);
  });

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
  .attr("r", rCounty)
  .attr("fill", youngFill)
  .attr("opacity", 1)
  .attr("stroke-width", 0)
  .attr("stroke", selectedOutline)
  .style("cursor", "crosshair")
  .on("mouseover", function (event, d) {
    selectSameState(d, "circle.county.young.ba.", youngSelectedFill);
    displayPointInfoCounty(d, "18-24", "BA", d3.select(this), v1_w);
  })
  .on("mouseout", function (event, d) {
    deselectSameState(d, "circle.county.young.ba.", youngFill);
    hidePointInfo(d3.select(this), youngFill, rCounty);
  })
  .on("click", (event, d) => {
    onClickCounty(d);
  });

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
  .attr("r", rCounty)
  .attr("fill", oldFill)
  .attr("opacity", 1)
  .attr("stroke-width", 0)
  .attr("stroke", selectedOutline)
  .style("cursor", "crosshair")
  .on("mouseover", function (event, d) {
    selectSameState(d, "circle.county.old.hs.", oldSelectedFill);
    displayPointInfoCounty(d, "25+", "HS", d3.select(this));
  })
  .on("mouseout", function (event, d) {
    deselectSameState(d, "circle.county.old.hs.", oldFill);
    hidePointInfo(d3.select(this), oldFill, rCounty);
  })
  .on("click", (event, d) => {
    onClickCounty(d);
  });

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
  .attr("r", rCounty)
  .attr("fill", oldFill)
  .attr("opacity", 1)
  .attr("stroke-width", 0)
  .attr("stroke", selectedOutline)
  .style("cursor", "crosshair")
  .on("mouseover", function (event, d) {
    selectSameState(d, "circle.county.old.ba.", oldSelectedFill);
    displayPointInfoCounty(d, "25+", "BA", d3.select(this), v1_w);
  })
  .on("mouseout", function (event, d) {
    deselectSameState(d, "circle.county.old.ba.", oldFill);
    hidePointInfo(d3.select(this), oldFill, rCounty);
  })
  .on("click", (event, d) => {
    onClickCounty(d);
  });

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

svg.append("text")
  .attr("class", "title left")
  .attr("font-size", "22px")
  .attr("font-family", "sans-serif")
  .attr("x", v1_w / 2)
  .attr("y", padding / 2 - 2)
  .attr("text-anchor", "middle")
  .text("Above High School Education");
svg.append("text")
  .attr("class", "title right")
  .attr("font-size", "22px")
  .attr("font-family", "sans-serif")
  .attr("x", v1_w * 1.5)
  .attr("y", padding / 2 - 2)
  .attr("text-anchor", "middle")
  .text("Above Bachelor's Degree");

const legendSize = 15;
const legendTextY = 13;
svg.append("rect")
  .attr("class", "legend young box")
  .attr("x", v1_w - 55)
  .attr("y", 0)
  .attr("width", legendSize)
  .attr("height", legendSize)
  .attr("fill", youngFill)
svg.append("text")
  .attr("class", "legend young")
  .attr("font-size", "14px")
  .attr("font-family", "sans-serif")
  .attr("x", v1_w - 35)
  .attr("y", legendTextY)
  .text("18-24");
svg.append("rect")
  .attr("class", "legend old box")
  .attr("x", v1_w + 25)
  .attr("y", 0)
  .attr("width", legendSize)
  .attr("height", legendSize)
  .attr("fill", oldFill)
svg.append("text")
  .attr("class", "legend old")
  .attr("font-size", "14px")
  .attr("font-family", "sans-serif")
  .attr("x", v1_w + 45)
  .attr("y", legendTextY)
  .text("25+");

d3.selectAll(".legend.young")
  .on("mouseover", function(event) {
    d3.selectAll("circle.old")
      .transition()
      .attr("opacity", 0.2);
  })
  .on("mouseout", function(event) {
    d3.selectAll("circle.old")
      .transition()
      .attr("opacity", 1);
  })
  .on("click", function() {
    let toShow = "circle.young." + curr_level + (focus_state !== 'none' ? "." + focus_state : "");
    d3.selectAll(toShow).raise().classed("hidden", showYoung);
    showYoung = !showYoung;
  });
d3.selectAll(".legend.old")
  .on("mouseover", function(event) {
    d3.selectAll("circle.young")
      .transition()
      .attr("opacity", 0.2);
  })
  .on("mouseout", function(event) {
    d3.selectAll("circle.young")
      .transition()
      .attr("opacity", 1);
  })
  .on("click", function() {
    let toShow = "circle.old." + curr_level + (focus_state !== 'none' ? "." + focus_state : "");
    d3.selectAll(toShow).raise().classed("hidden", showOld);
    showOld = !showOld;
  });

function getStatVal(d, statistic) {
  if (statistic === 'OTHMAT' && curr_level === 'county') {
    return d.ELMATS + d.AUDIO + d.VIDEO + d.EBOOK;
  }
  return d[statistic];
}

let onClickCounty = function(d) {
  const state = d.CNTY_KEY.split('-')[0];
  if (focus_state === state) {
    focus_state = 'none';
    let ageGroup = showYoung && showOld ? "" : showYoung ? ".young" : showOld ? ".old" : "XX";
    d3.selectAll("circle.county" + ageGroup)
      .classed("hidden", false);
  } else {
    showOneState(d.CNTY_KEY.split('-')[0]);
  }
}

function showOneState(state) {
  d3.selectAll("circle.county").classed("hidden", true);
  if (showYoung) {
    d3.selectAll("circle.county.young." + state).classed("hidden", false);
  }
  if (showOld) {
    d3.selectAll("circle.county.old." + state).classed("hidden", false);
  }
  focus_state = state;
}

let selectSameState = function(d, selector, color) {
  const state = d.CNTY_KEY.split('-')[0];
  d3.selectAll(selector + state)
    .raise()
    .attr("r", 4)
    .attr("fill", color);
}
let deselectSameState = function(d, selector, color) {
  const state = d.CNTY_KEY.split('-')[0];
  d3.selectAll(selector + state)
    .attr("r", rCounty)
    .attr("fill", color);
}

let hidePointInfo = function(circ, fill, r) {
  d3.select("#tooltip").classed("hidden", true);
  circ.transition()
    .duration(100)
    .attr("r", r)
    .attr("stroke-width", 0)
    .attr("fill", fill);
};

let displayPointInfoState = function(d, age, edu, circ, xAdj = 0) {
  circ.raise()
    .transition()
    .duration(100)
    .attr("stroke-width", 2)
    .attr("r", hoverRadius);
  const xPos = parseFloat(circ.attr("cx")) + 50 + xAdj;
  const yPos = parseFloat(circ.attr("cy")) + 320;

  const color = age === '18-24' ? youngOutline : oldOutline;

  let toolt = d3.select("#tooltip").style("top", yPos + "px");;
  toolt.style("left", xPos + "px");

  toolt.select("#tooltipname").text(ABBR_STATE_MAP[d.STABR]);
  toolt.select("#edu").text(EDU_DATA_BY_STATE[ABBR_STATE_MAP[d.STABR]][age][edu].PERCENT.toFixed(1))
    .style("color", "black");
  toolt.select("#age-group").text(age)
    .style("color", color);
  toolt.select("#edu-level").text(edu === 'HS' ? "HS diploma" : "bachelor's degree")
    .style("color", color);
  toolt.select("#stat")
    .text(() => {
      const val = getStatVal(d, curr_stat) / d.POPU_EST;
      return val < 0.1 ? val.toPrecision(2) : val.toFixed(1) + " " + STAT_UNIT_MAP[curr_stat];
    })
    .style("color", "black");

  d3.select("#tooltip").classed("hidden", false);
}

let displayPointInfoCounty = function(d, age, edu, circ, xAdj = 0) {
  circ.raise()
    .transition()
    .duration(100)
    .attr("stroke-width", 2)
    .attr("r", hoverRadius);
  const xPos = parseFloat(circ.attr("cx")) + 50 + xAdj;
  const yPos = parseFloat(circ.attr("cy")) + 320;

  const color = age === '18-24' ? youngOutline : oldOutline;

  let toolt = d3.select("#tooltip").style("top", yPos + "px");;
  toolt.style("left", xPos + "px");

  const parsed = d.CNTY_KEY.split('-');
  toolt.select("#tooltipname").text(parsed[1] + ", " + parsed[0]);
  toolt.select("#edu").text(EDU_DATA_BY_COUNTY[d.CNTY_KEY][age][edu].PERCENT.toFixed(1))
    .style("color", "black");
  toolt.select("#age-group").text(age)
    .style("color", color);
  toolt.select("#edu-level").text(edu === 'HS' ? "HS diploma" : "bachelor's degree")
    .style("color", color);
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
    .attr("cx", (d) => { return xScale2(getStatVal(d, statistic) / d.POPU_EST) });
  svg.select(".x.axis.left")
    .transition()
    .call(xAxis);
  svg.select(".x.axis.right")
    .transition()
    .call(xAxis2);
}

let toggleLevels = function (level) {
  d3.selectAll("circle." + (level === "state" ? "county" : "state")).classed("hidden", true);
  d3.selectAll("circle." + level).classed("hidden", false);
  if (level === 'county') {
    d3.selectAll(".noCounty").property("disabled", true);
  } else {
    d3.selectAll(".noCounty").property("disabled", false);
  }
  changeStatistic(curr_stat);
  focus_state = 'none';
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

// referencing https://d3-graph-gallery.com/graph/interactivity_zoom.html#brushingforzoom
// a function that sets idleTimeOut to null
var idleTimeout;
function idled() { idleTimeout = null; }
function updateChart(event) {
  extent = event.selection;

    // if no selection, back to initial coordinate; otherwise update x axis domain
    if (!extent) {
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
      xScale.domain(getXDomain(curr_level === "state" ? PLS_DATA_BY_STATE_2020 : PLS_DATA_BY_COUNTY_2020));
      yScale.domain(yScaleDomain);
    } else {
      xScale.domain([ xScale.invert(extent[0][0]), xScale.invert(extent[1][0]) ]);
      yScale.domain([ yScale.invert(extent[1][1]), yScale.invert(extent[0][1]) ]);
      v1.select(".brush").call(brush.move, null);
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
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
      xScale2.domain(getXDomain(curr_level === "state" ? PLS_DATA_BY_STATE_2020 : PLS_DATA_BY_COUNTY_2020));
      yScale2.domain(yScale2Domain);
    } else {
      xScale2.domain([ xScale2.invert(extent[0][0]), xScale2.invert(extent[1][0]) ]);
      yScale2.domain([ yScale2.invert(extent[1][1]), yScale2.invert(extent[0][1]) ]);
      v2.select(".brush").call(brush2.move, null);
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
