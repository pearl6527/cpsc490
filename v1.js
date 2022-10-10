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
let curr_year = 2020;

let svg = d3.select("body").append("svg").attr("width", w).attr("height", h);
let v1 = d3.select("svg").append("g").attr("id", "v1");

d3.json("https://raw.githubusercontent.com/pearl6527/cpsc490/master/us-states.json").then(function (geojson) {
  v1.selectAll("path.outlines")
    .data(geojson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", "us-map")
    .attr("id", (d) => {
      return STATE_ABBR_MAP[d.properties.name] + "path";
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
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke-width", 0.5).attr("fill", "#EEE");
    })
    .on("click", (d) => {
      changeStatistic('REFERENC');
    });
});

let changeStatistic = function (statistic) {
  if (statistic == 'BKVOL') {
    linScale.domain(PLS_SUM_DATA_RANGE[statistic]);
    curr_scale = linScale;
  } else {
    logScale.domain(PLS_SUM_DATA_RANGE[statistic]);
    curr_scale = logScale;
  }
  // console.log(logScale.domain());
  v1.selectAll(".us-map")
    .transition()
    .style("fill", (d) => {
      
      let value = PLS_SUM_DATA[curr_year][d.properties.name][statistic];
      console.log(d.properties.name, statistic, value, logScale(value));

      if (value && value != -1) {
        return color(logScale(value));
      } else {
        return "#eee";
      }
    });
  curr_stat = statistic;
}

let changeYear = function (year) {
  v1.selectAll(".us-map")
    .transition()
    .style("fill", (d) => {
      
      let value = PLS_SUM_DATA[year][d.properties.name][curr_stat];
      // console.log(d.properties.name, curr_stat, value, logScale(value));

      if (value && value != -1) {
        return color(logScale(value));
      } else {
        return "#eee";
      }
    });
  curr_year = year;
}
