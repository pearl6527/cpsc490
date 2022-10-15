let w = 1400;
let h = 700;
let padding = 40;

let AE_SET = new Set(AE_LIST);
let v1_w = 800;
let v1_h = 600;
let state_w = 300;
let state_h = 300;

let projScale = v1_w + 100;
let projection = d3.geoAlbersUsa()
  .translate([v1_w / 2, v1_h / 2])
  .scale([projScale]);
let path = d3.geoPath().projection(projection);

// 95821437
// 182181408
const logScale = d3.scaleLog().domain(PLS_SUM_DATA_RANGE.VISITS);
const linScale = d3.scaleLinear().domain(PLS_SUM_DATA_RANGE.BKVOL);
let curr_scale = logScale;
let color = d3.scaleSequential().domain([0, 1])
  .interpolator(d3.interpolatePurples);

// console.log(logScale.domain());
let curr_stat = 'VISITS';
let curr_stat_unit = STAT_UNIT_MAP[curr_stat];
let curr_year = 2020;
let curr_total = sumStatistic(curr_stat, curr_year);
let stat_per_capita = false;

let svg = d3.select("body").append("svg").attr("width", w).attr("height", h);
let v1 = d3.select("svg").append("g").attr("id", "v1");
let v2 = d3.select("svg").append("g").attr("id", "v2").attr("viewBox", [0, 0, state_w, state_h]);

function sumStatistic(statistic, year) {
  let total = 0;
  for (state in STATE_ABBR_MAP) {
    total += PLS_SUM_DATA[state][year][statistic];
  }
  return total;
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
      
      let value = PLS_SUM_DATA[d.properties.name][curr_year][curr_stat];

      if (value) {
        return color(curr_scale(value));
      } else {
        return "#eee";
      }
    })
    .on("mouseover", function (event, d) {
      d3.select(this).attr("stroke-width", 1.5).attr("fill", "#DEDEDE");
      d3.select(this).raise();
      updateStateTooltip(d.properties.name, PLS_SUM_DATA[d.properties.name][curr_year][curr_stat]);
      
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke-width", 0.5).attr("fill", "#EEE");
      updateStateTooltip("United States", curr_total);
    })
    .on("click", magnifyState);

});

let hideStateInfo = function() {
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
  let [[left, top], [right, bottom]] = path.bounds(d);

  let width = right - left;
  let height = bottom - top;
  let factor = state_w / (width > height ? width : height);

  let stateProjection = d3.geoAlbersUsa()
    .translate([25 + v1_w + factor * (v1_w / 2 - left), factor * (v1_h / 2 - top) + 60])
    .scale([projScale * factor]);
  let statePath = d3.geoPath().projection(stateProjection);
  
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
    .attr("fill", "#eee")
    .on("click", () => {
      hold_lib_tooltip = !hold_lib_tooltip;
    });
  
  updateSideStateTooltip(d.properties.name);
  d3.select("#side-statetooltip").classed("hidden", false);
  overlayLibraries(d, stateProjection);
  console.log(PLS_SUM_DATA[d.properties.name]);
}

let overlayLibraries = function (d, stateProjection) {
  d3.json("https://raw.githubusercontent.com/pearl6527/cpsc490/master/pls-outlet-data-by-state.json").then((json) => {
    const stateLibs = json[d.properties.name];
    v2.selectAll("circle")
      .data(stateLibs)
      .enter()
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
          .attr("r", 9);
        
        if (AE_SET.has(dd.id)) {
          // console.log(dd.LIBNAME);
        }
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
    .text(value ? value.toLocaleString() : "--");
}

let updateSideStateTooltip = function (state) {
  let statetool = d3.select("#side-statetooltip");
  statetool.select("#side-statename").text(state);
}

let buildId = function(idBase, prefix) {
  return "#" + prefix + idBase;
}
let displayLibraryTooltip = function(d, state, circ) {
  const xPos = parseFloat(circ.attr("cx"));
  const yPos = parseFloat(circ.attr("cy")) + 210;

  let toolt = d3.select("#tooltip").style("top", yPos + "px");;
  if (xPos > 1000) {
    toolt.style("right", xPos + "px")
  } else {
    toolt.style("left", xPos + "px")
  }

  toolt.select("#tooltipname").text(d.LIBNAME);

  let addrCol = d['C_OUT_TY'] === 'CE' ? centralOutline : branchOutline;
  toolt.select("#address").text(d.ADDRESS.toLowerCase() + ", " + d.CITY.toLowerCase() + ",")
    .style("color", addrCol);
  toolt.select("#address2").text(state + " " + d.ZIP + (d.ZIP4 !== "M" ? "-" + d.ZIP4 : ""))
    .style("color", addrCol);

  d3.select("#tooltip").classed("hidden", false);
}

let formatTooltipString = function (d) {
  let string = d.properties.name + "\n";
  if (PLS_SUM_DATA[d.properties.name][curr_year][curr_stat] === undefined) {
    string += "-- " + curr_stat_unit;
  } else {
    string += PLS_SUM_DATA[d.properties.name][curr_year][curr_stat].toLocaleString() + " " + curr_stat_unit;
  }
  return string;
}

let changeStatistic = function (statistic) {
  // if (statistic == 'BKVOL') {
  //   linScale.domain(PLS_SUM_DATA_RANGE[statistic]);
  //   curr_scale = linScale;
  // } else {
    logScale.domain(PLS_SUM_DATA_RANGE[statistic]);
    curr_scale = logScale;
  // }
  // console.log(logScale.domain());
  v1.selectAll(".us-map").selectAll("title").remove();
  v1.selectAll(".us-map")
    .transition()
    .style("fill", (d) => {
      
      let value = PLS_SUM_DATA[d.properties.name][curr_year][statistic];

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
  v1.selectAll(".us-map")
    .append("title")
    .text((d) => {
      return formatTooltipString(d);
    })
}

let changeYear = function (year) {
  v1.selectAll(".us-map")
    .transition()
    .style("fill", (d) => {
      
      let value = PLS_SUM_DATA[d.properties.name][year][curr_stat];

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
  v1.selectAll(".us-map")
    .append("title")
    .text((d) => {
      return formatTooltipString(d);
    })
}
