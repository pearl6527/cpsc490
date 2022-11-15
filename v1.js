let w = 1400;
let h = 1200;
let padding = 40;

let AE_SET = new Set(AE_LIST);
let v1_w = 700;
let v1_h = 435;
let state_w = 240;
let state_h = 240;

let projScale = v1_w + 100;
let projection = d3.geoAlbersUsa()
  .translate([v1_w / 2, v1_h / 2])
  .scale([projScale]);
let path = d3.geoPath().projection(projection);

const logScale = d3.scaleLog().domain(PLS_SUM_DATA_RANGE.VISITS);
const linScale = d3.scaleLinear().domain([0, 10]);
let curr_scale = logScale;
let color = d3.scaleSequential().domain([0, 1])
  .interpolator(d3.interpolatePurples);

let stat_per_capita = false;
let curr_stat = 'VISITS';
let curr_stat_unit = STAT_UNIT_MAP[curr_stat];
let curr_year = 2020;
let curr_total = sumStatistic(curr_stat, curr_year);
let focus_state = 'none';

let svg = d3.select("body").append("svg").attr("width", w).attr("height", h).attr("transform", "translate(0, 25)");
let v1 = d3.select("svg").append("g").attr("id", "v1");
let v2 = d3.select("svg").append("g").attr("id", "v2").attr("viewBox", [0, 0, state_w, state_h]);

function roundDecimal(n, place) {
  const pow = Math.pow(10, place);
  return Math.round(pow * n, 1) / pow;
}
function sumStatistic(statistic, year) {
  let total = 0;
  let popu = 0;
  for (state in STATE_ABBR_MAP) {
    total += PLS_SUM_DATA[state][year][statistic];
    popu += PLS_SUM_DATA[state][year]['POPU'];
  }
  return stat_per_capita ? roundDecimal(total / popu, 1) : total;
}

d3.json("https://raw.githubusercontent.com/pearl6527/cpsc490/master/us-states.json").then(function (geojson) {
  v1.selectAll("path.outlines")
    .data(geojson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", "us-map")
    .attr("id", (d) => {
      return d.properties.name + "-path";
    })
    .attr("stroke", "#444")
    .attr("stroke-width", 0.5)
    // .attr("fill", "#EEE")
    .style("fill", (d) => {
      
      let value = getStatValue(d.properties.name, curr_year, curr_stat);
      d.currVal = value;

      if (value) {
        return color(curr_scale(value));
      } else {
        return "#eee";
      }
    })
    .on("mouseover", function (event, d) {
      d3.select(this).attr("stroke-width", 2).attr("fill", "#DEDEDE");
      d3.select(this).raise();
      updateStateTooltip(d.properties.name, d.currVal);
      
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke-width", 0.5).attr("fill", "#EEE");
      updateStateTooltip("United States", curr_total);
    })
    .on("click", magnifyState);

});

let hideStateInfo = function() {
  focus_state = 'none';
  v2.selectAll(".individual-state")
    .transition()
    .duration(100)
    .attr("opacity", 0)
    .remove();
  d3.select("#side-statetooltip").classed("hidden", true);
};
let hideLibraryInfo = function() {
  d3.select("#tooltip").classed("hidden", true);
};

let branchOutline = "rgba(23, 148, 155, 1)";
let branchFill = "rgba(20, 175, 183, 0.8)";
let centralOutline = "rgba(85, 70, 105, 1)";
let centralFill = "rgba(89, 74, 212, 0.8)";

let magnifyState = function(event, d) {
  v2.selectAll(".individual-state").remove();
  focus_state = d.properties.name;
  let [[left, top], [right, bottom]] = path.bounds(d);

  let height = bottom - top;
  let width = right - left;
  let factor = state_w / height;
  factor = width * factor > 500 ? 500 / width : factor;

  let stateProjection = d3.geoAlbersUsa()
    .translate([70 + v1_w + factor * (v1_w / 2 - left), factor * (v1_h / 2 - top) + 60])
    .scale([projScale * factor]);
  let statePath = d3.geoPath().projection(stateProjection);
  
  v2.append("rect")
    .attr("fill", "#ccc")
    .attr("class", "individual-state")
    .attr("x", 725)
    .attr("y", 40)
    .attr("rx", 7)
    .attr("ry", 7)
    .attr("width", 590)
    .attr("height", 275);

  v2.selectAll("path.outlines.state")
    .data([d])
    .enter()
    .append("path")
    .attr("d", statePath)
    .attr("class", "us-map individual-state")
    .attr("id", (dd) => {
      return dd.properties.name + "-path-created";
    })
    .attr("stroke", "#444")
    .attr("stroke-width", 0.5)
    .attr("fill", "#fff")
    // .on("click", () => {
    //   hold_lib_tooltip = !hold_lib_tooltip;
    // });
  
  updateSideStateTooltip(d.properties.name);
  d3.select("#side-statetooltip").classed("hidden", false);
  // d3.select("#side-state-popu").text(PLS_SUM_DATA[d.properties.name][2020]['POPU'].toLocaleString());
  overlayLibraries(d, stateProjection);
  buildPlot(d.properties.name);
  // console.log(PLS_SUM_DATA[d.properties.name]);
}

let overlayLibraries = function (d, stateProjection) {
  d3.json("https://raw.githubusercontent.com/pearl6527/cpsc490/master/pls-outlet-data-by-state.json").then((json) => {
    const stateLibs = json[d.properties.name];
    v2.selectAll("circle")
      .data(stateLibs)
      .enter()
      .append("svg:a")
      .attr("xlink:href", (dd) => {
        let fullName = dd.LIBNAME.replace(/[,.]/, '').replace(' ', '+')
          + '+' + dd.CITY + '+' + d.properties.name + '+' + dd.ZIP;
        return 'https://www.google.com/maps/search/?api=1&query=' + fullName;
      })
      .attr("target", '_blank')
      .append("circle")
      .attr("id", (dd) => {
        return dd.id
      })
      .attr("class", "individual-state")
      .attr("cx", (dd) => {
        if (isNaN(dd.LONGITUD) || isNaN(dd.LATITUDE)) {
          return -1000;
        } else {
          let proj = stateProjection([dd.LONGITUD, dd.LATITUDE]);
          return proj !== null ? proj[0] : -1000;
        }
      })
      .attr("cy", (dd) => {
        if (isNaN(dd.LONGITUD) || isNaN(dd.LATITUDE)) {
          return -1000;
        } else {
          let proj = stateProjection([dd.LONGITUD, dd.LATITUDE]);
          return proj !== null ? proj[1] : -1000;
        }
      })
      .attr("r", 3)
      .attr("fill", (dd) => {
        if (dd['C_OUT_TY'] === 'CE') {
          return centralFill;
        }
        return branchFill;
      })
      .attr("stroke", (dd) => {
        if (dd['C_OUT_TY'] === 'CE') {
          return centralOutline;
        }
        return branchOutline;
      })
      .attr("opacity", 0)
      .style("stroke-width", 0.5)
      .style("cursor", "crosshair")
      .on("mouseover", function (event, dd) {
        // console.log(event.pageX, event.pageY)
        d3.select(this)
          .transition()
          .duration(100)
          .attr("stroke-width", 0)
          .attr("opacity", 0.8)
          .attr("r", 6);
        displayLibraryTooltip(dd, d.properties.name, d3.select(this));
      })
      .on("mouseout", function (event, dd) {
        hideLibraryInfo();
        d3.select(this)
          .transition()
          .duration(100)
          .attr("stroke-width", 0.5)
          .attr("opacity", 0.4)
          .attr("r", 3);
      })
      .transition()
      .attr("opacity", 0.7);
  });
}

let buildViz = function(state) {
  // get data
  let data = {BKVOL: 0, AUDIO: 0, VIDEO: 0, EBOOK: 0};
  let labels = {BKVOL: 'Print', AUDIO: 'Audio', VIDEO: 'Video', EBOOK: 'Ebooks'};
  for (key of Object.keys(data)) {
    data[key] += PLS_SUM_DATA[state]["2020"][key] != -1 ? PLS_SUM_DATA[state]["2020"][key] : 0;
  }

  // set color scale
  let color = d3.scaleOrdinal()
    .domain(["BKVOL", "AUDIO", "VIDEO", "EBOOK"])
    .range(d3.schemeDark2);

  let pie = d3.pie()
    .sort(null)
    .value((d) => { return d[1] })
  let data_ready = pie(Object.entries(data))

  let radius = 125;
  let arc = d3.arc()
    .innerRadius(radius * 0.5)
    .outerRadius(radius * 0.8)

  // arc for label positioning
  let outerArc = d3.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9)

  let chart = v2.append("g")
    .attr("transform", "translate(" + (v1_w + radius + 110) + "," + (state_h * 1.8 + 340) + ")");

  chart.selectAll('allSlices')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', arc)
    .attr("class", "individual-state")
    .attr('fill', (d) => { return(color(d.data[0])) })
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .attr("opacity", 0)
    .transition()
    .attr("opacity", 1)

  // polylines between chart and labels:
  chart.selectAll('allPolylines')
    .data(data_ready)
    .enter()
    .append('polyline')
    .attr("stroke", "black")
    .attr("class", "individual-state")
    .style("fill", "none")
    .attr("stroke-width", 1)
    .attr('points', function(d) {
      var posA = arc.centroid(d) // line insertion in the slice
      var posB = outerArc.centroid(d) // line break
      var posC = outerArc.centroid(d); // label position
      var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // see if x position at extreme right or extreme left
      posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on right or left
      return [posA, posB, posC];
    })
    .attr("opacity", 0)
    .transition()
    .attr("opacity", 1);

  chart.selectAll('allLabels')
    .data(data_ready)
    .enter()
    .append('text')
    .attr("class", "individual-state")
    .text((d) => { return labels[d.data[0]] })
    .attr('transform', (d) => {
        var pos = outerArc.centroid(d);
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return 'translate(' + pos + ')';
    })
    .attr("font-family", "sans-serif")
    .style('text-anchor', function(d) {
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        return (midangle < Math.PI ? 'start' : 'end')
    })
    .attr("opacity", 0)
    .transition()
    .attr("opacity", 1);
}

let buildPlot = function(state) {
  if (curr_stat === 'OTHMAT' || curr_stat === 'BKVOL') {
    buildViz(state);
  }
  var trace = {
    x: [],
    y: [],
    mode: 'lines+markers',
    type: 'scatter'
  };
  for (let i = 1998; i <= 2020; i++) {
    trace.x.push(i);
    trace.y.push(PLS_SUM_DATA[state][i][curr_stat] / PLS_SUM_DATA[state][i]['POPU']);
  }
  const multTraces = curr_stat === 'OTHMAT';
  var properties = multTraces ? ['EBOOK', 'AUDIO', 'VIDEO'] : [curr_stat];
  var data = getTraces(state, properties);
  var layout = {
    margin: { l: 60, r: 0, b: 40, t: 50, pad: 5 },
    title: {
      text: $('#map-dropdown option[value="' + curr_stat + '"]').text() + ' (1998-2020)',
      x: 0
    },
    xaxis: {title: {
      text: 'YEAR',
      font: {
        size: 12,
        color: '#AAA'
      }
    }},
    yaxis: {title: {
      text: STAT_UNIT_MAP[curr_stat].toUpperCase(),
      font: {
        size: 12,
        color: '#AAA'
      },
      x: 0
    }}
  };
  
  Plotly.newPlot('visits-plot', data, layout, {displayModeBar: false});
}

let getTraces = function(state, properties) {
  var traces = [];
  for (const p of properties) {
    var trace = {
      x: [],
      y: [],
      mode: 'lines+markers',
      type: 'scatter',
      name: p
    };
    for (let i = 1998; i <= 2020; i++) {
      trace.x.push(i);
      trace.y.push(PLS_SUM_DATA[state][i][p] != -1 ? PLS_SUM_DATA[state][i][p] : 0);
    }
    traces.push(trace);
  }
  return traces;
  
}

// let findBoundingBox = function (coords) {
//   let min_x = coords[0][0];
//   let min_y = coords[0][1];
//   let max_x = min_x;
//   let max_y = min_y;
//   for (let coord of coords) {
//     min_x = coord[0] < min_x ? coord[0] : min_x;
//     max_x = coord[0] > max_x ? coord[0] : max_x;
//     min_y = coord[0] < min_y ? coord[0] : min_y;
//     max_y = coord[0] > max_y ? coord[0] : max_y;
//   }
//   return {left: min_x, right: max_x, top: max_y, bottom: min_y, width: max_x - min_x, height: max_y - min_y};
// }

// let getProjectedCoords = function (vals) {
//   let coords = []
//   for (const e of vals) {
//     if (Array.isArray(e[0])) {
//       for (const f of e) {
//         coords.push(projection(f));
//       }
//     } else {
//       coords.push(projection(e));
//     }
//   }
//   return coords;
// }

let updateStateTooltip = function (state, value) {
  let statetool = d3.select("#statetooltip");
  statetool.select("#statename")
    .text(state);
  statetool.select("#stat-value")
    .text(value && value >= 0 ? value.toLocaleString() : "--");
}

let updateSideStateTooltip = function (state) {
  let statetool = d3.select("#side-statetooltip");
  statetool.select("#side-statename").text(state);
}

// let buildId = function(idBase, prefix) {
//   return "#" + prefix + idBase;
// }
let formatPhoneNum = (n) => {
  let str = n.toString();
  let match = str.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  };
  return 'PHONE # NOT AVAILABLE';
};

let displayLibraryTooltip = function(d, state, circ) {
  const xPos = parseFloat(circ.attr("cx"));
  const yPos = parseFloat(circ.attr("cy")) + 225;

  let toolt = d3.select("#tooltip").style("top", yPos + "px");;
  if (xPos > 1000) {
    toolt.style("left", (xPos - 180) + "px")
  } else {
    toolt.style("left", xPos + "px")
  }

  toolt.select("#tooltipname").text(d.LIBNAME);

  let addrCol = d['C_OUT_TY'] === 'CE' ? centralOutline : branchOutline;
  toolt.select("#address").text(d.ADDRESS.toLowerCase() + ", " + d.CITY.toLowerCase() + ",")
    .style("color", addrCol);
  toolt.select("#address2").text(STATE_ABBR_MAP[state] + " " + d.ZIP + (d.ZIP4 !== "M" ? "-" + d.ZIP4 : ""))
    .style("color", addrCol);
  toolt.select("#phone-num").text(formatPhoneNum(d.PHONE))
    .style("color", "black");

  d3.select("#tooltip").classed("hidden", false);
}

let getStatValue = function (state, year, statistic) {
  if (stat_per_capita) {
    // console.log(roundDecimal(PLS_SUM_DATA[state][year][statistic] / PLS_SUM_DATA[state][year]['POPU'], 1));
    return roundDecimal(PLS_SUM_DATA[state][year][statistic] / PLS_SUM_DATA[state][year]['POPU'], 1);
  }
  return PLS_SUM_DATA[state][year][statistic];
}

let changeStatistic = function (statistic) {
  if (stat_per_capita) {
    linScale.domain(PLS_SUM_DATA_RANGE[statistic + '_percap']);
    curr_scale = linScale;
  } else {
    logScale.domain(PLS_SUM_DATA_RANGE[statistic]);
    curr_scale = logScale;
  }
  v1.selectAll(".us-map").selectAll("title").remove();
  v1.selectAll(".us-map")
    .transition()
    .style("fill", (d) => {
      
      let value = getStatValue(d.properties.name, curr_year, statistic);
      d.currVal = value;

      if (value && value >= 0) {
        return color(curr_scale(value));
      } else {
        return "#eee";
      }
    });

  curr_stat = statistic;
  curr_stat_unit = STAT_UNIT_MAP[curr_stat];
  curr_total = sumStatistic(statistic, curr_year);
  updateStateTooltip("United States", curr_total);
  buildPlot(focus_state);
}

let changeYear = function (year) {
  v1.selectAll(".us-map")
    .transition()
    .style("fill", (d) => {
      
      let value = getStatValue(d.properties.name, year, curr_stat);
      d.currVal = value;

      if (value && value >= 0) {
        return color(curr_scale(value));
      } else {
        return "#eee";
      }
    });
  curr_year = year;
  curr_total = sumStatistic(curr_stat, year);
  updateStateTooltip("United States", curr_total);
  v1.selectAll(".us-map").selectAll("title").remove();
}

d3.selectAll("input.perCapitaToggle").on("click", function () {
  let cat = d3.select(this).node().value;

  if (cat == "total" && stat_per_capita) {
    stat_per_capita = false;
    d3.select("#per-cap-label").text("total");
  } else if (cat == "percapita" && !stat_per_capita) {
    stat_per_capita = true;
    d3.select("#per-cap-label").text("per person");
  }
  changeStatistic(curr_stat);
});
