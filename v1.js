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

let svg = d3.select("body").append("svg").attr("width", w).attr("height", h);
let v1 = d3.select("svg").append("g").attr("id", "v1");

d3.json("https://raw.githubusercontent.com/pearl6527/cpsc490/master/us-states.json").then(function (geojson) {
d3.json("")

});
