let w = 1400;
let h = 700;
let padding = 40;

let height_adj = 30;

let v1_w = 800;
let v1_h = 600;

let projection = d3
  .geoAlbersUsa()
  .translate([v1_w / 2, v1_h / 2])
  .scale([v1_w + 100]);
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
// console.log(curr_total);

let svg = d3.select("body").append("svg").attr("width", w).attr("height", h);
let v1 = d3.select("svg").append("g").attr("id", "v1");

function sumStatistic(statistic, year) {
  let total = 0;
  for (state in PLS_SUM_DATA[year]) {
    total += PLS_SUM_DATA[year][state][statistic];
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
      
      let value = PLS_SUM_DATA[curr_year][d.properties.name][curr_stat];
      console.log(d.properties.name, value, curr_scale(value));

      if (value) {
        return color(curr_scale(value));
      } else {
        return "#eee";
      }
    })
    .on("mouseover", function (event, d) {
      d3.select(this).attr("stroke-width", 1.5).attr("fill", "#DEDEDE");
      updateStateTooltip(d.properties.name, PLS_SUM_DATA[curr_year][d.properties.name][curr_stat]);
      
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke-width", 0.5).attr("fill", "#EEE");
      updateStateTooltip("United States", curr_total);
    })
    .append("title")
    .text((d)=> {
      return formatTooltipString(d);
    });
});

d3.json("https://raw.githubusercontent.com/pearl6527/cpsc490/master/state-pls-ae-data.json").then(function (json) {
  v1.selectAll("circle")
    .data(json)
    .enter()
    .append("circle")
    .attr("id", (d) => {
      console.log(d.id);
      return d.id;
    })
    .attr("cx", (d) => {
      if (isNaN(d.lon) || isNaN(d.lat)) {
        return -1000;
      } else {
        return projection([d.lon, d.lat])[0];
      }
    })
    .attr("cy", (d) => {
      if (isNaN(d.lon) || isNaN(d.lat)) {
        return -1000;
      } else {
        return projection([d.lon, d.lat])[1];
      }
    })
    .attr("r", 3)
    .attr("fill", (d) => {
      return "blue";
    })
    .attr("stroke", (d) => {
      return "blue";
    })
    .attr("opacity", 0.4)
    .style("stroke-width", 0.5)
    .style("cursor", "crosshair")
    .style("visibility", (d) => {
      return isNaN(d.lon) || isNaN(d.lat) ? "hidden" : "visible";
    })
    .on("mouseover", function (event, d) {
      // d3.select("#" + d.state + "path")
      //   .attr("stroke-width", 1.5)
      //   .attr("fill", "#DEDEDE");

      // let statetool = d3.select("#statetooltip");

      // let result = json.features.filter((obj) => {
      //   return obj.properties.abbr == d.state;
      // });
      // // console.log(result);

      // statetool.select("#statename").text(result[0].properties.name);

      // let c = getStateCount(
      //   result[0].properties.value,
      //   result[0].properties.male,
      //   result[0].properties.female
      // );

      // statetool.select("#shootings").text(formatAsThousands(c));

      // d3.select(this)
      //   .transition()
      //   .duration(100)
      //   .attr("stroke-width", 0)
      //   .attr("opacity", 0.8)
      //   .attr("r", 9);

      // let xPosition = parseFloat(d3.select(this).attr("cx")) + 40;
      // let yPosition =
      //   parseFloat(d3.select(this).attr("cy")) + 100 + height_adj;
      // // console.log(xPosition, yPosition)

      // let toolt = d3
      //   .select("#tooltip")
      //   .style("left", xPosition + "px")
      //   .style("top", yPosition + "px");

      // toolt.select("#tooltipname").text(d.name == "" ? "Unknown" : d.name);

      // let r = getRace(d.race);
      // toolt
      //   .select("#race")
      //   .text(() => {
      //     if (r == "NativeAmerican") {
      //       return "Native American ";
      //     }
      //     if (r == "Other") {
      //       return "";
      //     }
      //     return r + " ";
      //   })
      //   .style(
      //     "color",
      //     getRaceCol(r == "NativeAmerican" ? "Native American" : r)
      //   );

      // toolt.select("#age").text(isNaN(d.age) ? "?" : d.age);

      // toolt.select("#gender").text(getGender(d.gender));

      // toolt.select("#date").text(formatDate(d.date));

      // d3.select("#tooltip").classed("hidden", false);
    })
    .on("mouseout", function (event, d) {
      // d3.select(this)
      //   .transition()
      //   .duration(100)
      //   .attr("stroke-width", 0.5)
      //   .attr("opacity", 0.4)
      //   .attr("r", 3);

      // d3.select("#" + d.state + "path")
      //   .attr("stroke-width", 0.5)
      //   .attr("fill", "#EEE");

      // let statetool = d3.select("#statetooltip");

      // statetool.select("#statename").text("United States");

      // let c = getStateCount(total, maCount, feCount);
      // statetool.select("#shootings").text(formatAsThousands(c));

      // d3.select("#tooltip").classed("hidden", true);
    });

});

let updateStateTooltip = function (state, value) {
  let statetool = d3.select("#statetooltip");
  statetool.select("#statename")
    .text(state);
  statetool.select("#stat-value")
    .text(value ? value.toLocaleString() : "--");
}

let formatTooltipString = function (d) {
  let string = d.properties.name + "\n";
  if (PLS_SUM_DATA[curr_year][d.properties.name][curr_stat] === undefined) {
    string += "-- " + curr_stat_unit;
  } else {
    string += PLS_SUM_DATA[curr_year][d.properties.name][curr_stat].toLocaleString() + " " + curr_stat_unit;
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
      
      let value = PLS_SUM_DATA[curr_year][d.properties.name][statistic];
      console.log(d.properties.name, statistic, value, logScale(value));

      if (value && value != -1) {
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
      
      let value = PLS_SUM_DATA[year][d.properties.name][curr_stat];
      // console.log(d.properties.name, curr_stat, value, logScale(value));

      if (value && value != -1) {
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
