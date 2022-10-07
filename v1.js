let w = 1400;
let h = 900;
let padding = 40;

let height_adj = 30;

let v1_w = 800;
let v1_h = 700;

let projection = d3
  .geoAlbersUsa()
  .translate([v1_w / 2, v1_h / 2])
  .scale([v1_w + 100]);
let path = d3.geoPath().projection(projection);

let color = d3.scaleQuantize()
  .range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);

let svg = d3.select("body").append("svg").attr("width", w).attr("height", h);
let v1 = d3.select("svg").append("g").attr("id", "v1");

d3.json("https://raw.githubusercontent.com/pearl6527/cpsc490/master/us-states.json").then(function (geojson) {
d3.json("https://raw.githubusercontent.com/pearl6527/cpsc490/master/state-pls-sum-data.json").then(function (plssumjson) {
  v1.selectAll("path.outlines")
    .data(geojson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("id", (d) => {
      return STATE_ABBR_MAP[d.properties.name] + "path";
    })
    .attr("stroke", "#444")
    .attr("stroke-width", 0.5)
    // .attr("fill", "#EEE")
    .style("fill", (d)=> {
      console.log(d.properties.name);
      let value = plssumjson[2020][d.properties.name]['VISITS'];
      
      if (value) {
        return color(value);
      } else {
        return "#eee";
      }
    })
    .on("mouseover", function (event, d) {
      d3.select(this).attr("stroke-width", 1.5).attr("fill", "#DEDEDE");
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke-width", 0.5).attr("fill", "#EEE");
    });
});
});
