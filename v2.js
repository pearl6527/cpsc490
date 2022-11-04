let w = 1400;
let h = 700;
let padding = 40;
let v1_w = 800;
let v1_h = 500;

let svg = d3.select("body").append("svg").attr("width", w).attr("height", h);
let v1 = d3.select("svg").append("g").attr("id", "v1").attr("clip-path", "url(#clip)");

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

let yScale = d3.scaleLinear()
  .domain([ 0, d3.max(PLS_DATA_BY_STATE_2020, (d) => d.POV_PERCENT) + 1 ])
  .range([v1_h - padding, padding]);

let clip = svg.append("defs").append("svg:clipPath")
  .attr("id", "clip")
  .append("svg:rect")
  .attr("width", v1_w - padding * 1.5)
  .attr("height", v1_h - padding * 2)
  .attr("x", padding)
  .attr("y", padding);

const brush = d3.brushX()                     // Add the brush feature using the d3.brush function
  .extent( [ [-10, 0], [v1_w, v1_h + 10] ] )   // initialise the brush area: start at 0,0 and finishes at width, height
  .on("end", (event) => updateChart(event));  // Each time the brush selection changes, trigger 'updateChart' function

v1.append("g")
  .attr("class", "brush")
  .call(brush);

const stateFill = 'rgba(27, 41, 195, 0.9)';
const stateHoverFill = 'rgba(249, 25, 137, 0.9)';
const cntyFill = 'rgba(249, 25, 137, 0.7)';
const selectedFill = 'rgba(20, 35, 190, 0.9)';

v1.selectAll("circle.state")
  .data(PLS_DATA_BY_STATE_2020)
  .enter()
  .append("circle")
  .attr("clip-path", clip)
  .attr("id", (d) => d.STABR)
  .attr("class", "state")
  .attr("cx", (d) => { return xScale(d.VISITS / d.POPU_EST) })
  .attr("cy", (d) => { return yScale(d.POV_PERCENT) })
  .attr("r", 4)
  .attr("fill", stateFill)
  .attr("opacity", 1)
  .style("cursor", "crosshair")
  .on("mouseover", function (event, d) {
    d3.select(this)
      .transition()
      .duration(100)
      .attr("fill", stateHoverFill)
      .attr("r", 7);
    displayPointInfo(d, d.STABR, d3.select(this));
  })
  .on("mouseout", function () {
    hidePointInfo();
    d3.select(this)
      .transition()
      .duration(100)
      .attr("r", 4)
      .attr("fill", stateFill);
  })
  // .append("title")
  // .text((d) => ABBR_STATE_MAP[d.STABR]);

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
  .attr("r", 3)
  .attr("fill", cntyFill)
  .attr("opacity", 1)
  .style("cursor", "crosshair")
  .on("mouseover", function (event, d) {
    d3.selectAll("circle.county." + d.CNTY_KEY.split('-')[0])
      .raise()
      .transition()
      .duration(100)
      .attr("r", 4)
      .attr("fill", selectedFill);
    d3.select(this)
      .transition()
      .duration(100)
      .attr("fill", selectedFill)
      .attr("r", 6);
    displayPointInfo(d, d.CNTY_KEY, d3.select(this));
  })
  .on("mouseout", function (event, d) {
    const state = d.CNTY_KEY.split('-')[0];
    d3.selectAll("circle.county." + state)
      .transition()
      .attr("r", 3)
      .attr("fill", () => { return state !== focus_state ? cntyFill : selectedFill });
    d3.selectAll("circle.county." + focus_state).raise();
    hidePointInfo();
  })
  .on("click", (event, d) => {
    const state = d.CNTY_KEY.split('-')[0];
    if (focus_state === state) {
      focus_state = 'none';
      d3.selectAll("circle.county")
        .classed("hidden", false);
    } else {
      showOneState(d.CNTY_KEY.split('-')[0])
    }
  });
  // .append("title")
  // .text((d) => d.CNTY_KEY);

const xAxis = d3.axisBottom()
  .scale(xScale)
  .ticks(10);

const yAxis = d3.axisLeft()
  .scale(yScale)
  .ticks(10);

svg.append("g")
  .attr("class", "x axis")
  .style("font-size", "12px")
  .attr("transform", "translate(0," + (v1_h - padding) + ")")
  .call(xAxis);

svg.append("g")
  .attr("class", "y axis")
  .style("font-size", "12px")
  .attr("transform", "translate(" + padding + ", 0)")
  .call(yAxis);

svg.append("text")
  .attr("id", "x-axis-label")
  .attr("class", "x axis label")
  .attr("font-size", "14px")
  .attr("font-family", "sans-serif")
  .attr("x", v1_w / 2)
  .attr("y", v1_h - padding + 40)
  .attr("text-anchor", "middle")
  .text("visits per person");

svg.append("text")
  .attr("class", "y axis label")
  .attr("text-anchor", "middle")
  .attr("font-family", "sans-serif")
  .attr("font-size", "14px")
  .attr("x", 480)
  .attr("y", h - 30)
  .attr("transform", "rotate(270, " + padding +  ", " + h + ")")
  .text("Poverty (%)");

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
  yScale.domain([0, d3.max(data, (d) => d.POV_PERCENT) + 1])

  v1.selectAll("circle." + curr_level)
    .transition("reposition")
    .attr("cx", (d) => { return xScale(getStatVal(d, statistic) / d.POPU_EST) })
    .attr("cy", (d) => { return yScale(d.POV_PERCENT) });
  svg.select(".x.axis")
    .transition()
    .call(xAxis);
  svg.select(".y.axis")
    .transition()
    .call(yAxis);
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
    } else {
      xScale.domain([ xScale.invert(extent[0]), xScale.invert(extent[1]) ])
      v1.select(".brush").call(brush.move, null); // remove grey brush area as soon as the selection has been done
    }

    d3.select(".x.axis").transition().duration(1000).call(xAxis);
    v1.selectAll("circle." + curr_level)
      .transition("recalibrate")
      .duration(1000)
      .attr("cx", function (d) { return xScale(getStatVal(d, curr_stat) / d.POPU_EST) } );
}
