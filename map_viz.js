let w = 1400;
let h = 900;
let padding = 40;

let height_adj = 30;

let v1_w = 800;
let v1_h = 700;

let v2_w = 500;
let v2_h = 400;

let v3_h = 370;

let maCol = "rgb(32, 196, 166)";
let feCol = "rgb(251, 132, 4)";
let naCol = "#484848";

let showM = true;
let showF = true;

let projection = d3
  .geoAlbersUsa()
  .translate([v1_w / 2, v1_h / 2])
  .scale([v1_w + 100]);

let path = d3.geoPath().projection(projection);

let svg = d3.select("body").append("svg").attr("width", w).attr("height", h);

let v1 = d3.select("svg").append("g").attr("id", "v1");
// let v2 = d3
//   .select("svg")
//   .append("g")
//   .attr("id", "v2")
//   .attr("transform", "translate(" + v1_w + ", 0)");
// let v3 = d3
//   .select("svg")
//   .append("g")
//   .attr("id", "v3")
//   .attr("transform", "translate(" + v1_w + "," + v2_h + ")");

let parseDate = d3.timeParse("%Y-%m-%d");
let formatAsThousands = d3.format(",");
let formatDate = d3.timeFormat("%Y-%m-%d");

let race_cols = [
  "rgb(0,192,199)",
  "rgb(81,68,211)",
  "rgb(218,53,144)",
  "rgb(86, 218, 0)",
  "rgb(228,26,28)",
];
let races = ["Asian", "White", "Hispanic", "Black", "Native American"]; //, "Other"]
let getRaceCol = function (t) {
  return race_cols[races.indexOf(t)];
};

let getGender = function (t) {
  if (t == "M") {
    return "male";
  }
  if (t == "F") {
    return "female";
  }
  return "person";
};

let getGenderColor = function (t, a, b, c) {
  if (t == "M") {
    return a;
  }
  if (t == "F") {
    return b;
  }
  return c;
};

let getStateCount = function (total, m, f) {
  if (showM && !showF) {
    return m;
  }
  if (showF && !showM) {
    return f;
  }
  return total;
};

let rowConverter = function (d) {
  return {
    id: d.id,
    name: d.name,
    date: parseDate(d.date),
    manner_of_death: d.manner_of_death,
    armed: d.armed,
    age: parseInt(d.age),
    gender: d.gender,
    race: d.race,
    city: d.city,
    state: d.state,
    threat_level: d.threat_level,
    flee: d.flee,
    lon: parseFloat(d.longitude),
    lat: parseFloat(d.latitude),
  };
};

d3.csv(
  "https://raw.githubusercontent.com/pearl6527/CPSC-446-Assignment-6/main/fatal-police-shootings-data.csv",
  rowConverter
).then((data) => {
  // console.log(data.length);

  const total = data.length;

  const feCount = data.filter((obj) => obj.gender === "F").length;
  const maCount = data.filter((obj) => obj.gender === "M").length;

  // let result = data.map(a => a.gender);
  // list = [... new Set(result)];
  // console.log(list);
  let stateConverter = function (d) {
    return {
      state: d.state,
      abbr: d.abbr,
      count: parseInt(d.shootings),
      male: parseInt(d.male),
      female: parseInt(d.female),
      person: parseInt(d.other),
    };
  };
  d3.csv(
    "https://raw.githubusercontent.com/pearl6527/CPSC-446-Assignment-6/main/state_shootings_by_gender.csv",
    stateConverter
  ).then(function (data_by_state) {
    // console.log(data_by_state);
    // })

    d3.json(
      "https://raw.githubusercontent.com/pearl6527/CPSC-446-Assignment-6/main/us-states.json"
    ).then(function (json) {
      // console.log(json)
      for (let i = 0; i < data_by_state.length; i++) {
        let s = data_by_state[i].state;
        let v = data_by_state[i].count;
        let a = data_by_state[i].abbr;
        let m = data_by_state[i].male;
        let f = data_by_state[i].female;
        for (let j = 0; j < json.features.length; j++) {
          let jsonS = json.features[j].properties.name;
          // console.log(jsonS, s, v);
          if (s == jsonS) {
            // console.log("here")
            json.features[j].properties.value = v;
            json.features[j].properties.abbr = a;
            json.features[j].properties.male = m;
            json.features[j].properties.female = f;
            break;
          }
        }
      }

      v1.append("text")
        .attr("class", "map_title")
        .attr("font-size", "24px")
        .attr("font-family", "sans-serif")
        .attr("x", padding)
        .attr("y", (padding * 2) / 3)
        .text("Map of Fatal Police Shootings");
      v1.append("text")
        .attr("class", "map_subtitle")
        .attr("font-size", "18px")
        .attr("font-family", "sans-serif")
        .attr("x", padding)
        .attr("y", (padding * 2) / 3 + 26)
        .attr("fill", "#777")
        .text("Jan. 1, 2015 – Nov. 16, 2021");

      v1.selectAll("path.outlines")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", (d) => {
          return d.properties.abbr + "path";
        })
        .attr("stroke", "#444")
        .attr("stroke-width", 0.5)
        .attr("fill", "#EEE")
        .on("mouseover", function (event, d) {
          d3.select(this).attr("stroke-width", 1.5).attr("fill", "#DEDEDE");

          let statetool = d3.select("#statetooltip");

          statetool.select("#statename").text(d.properties.name);

          let c = getStateCount(
            d.properties.value,
            d.properties.male,
            d.properties.female
          );

          statetool.select("#shootings").text(formatAsThousands(c));
        })
        .on("mouseout", function () {
          d3.select(this).attr("stroke-width", 0.5).attr("fill", "#EEE");

          let statetool = d3.select("#statetooltip");

          statetool.select("#statename").text("United States");

          let c = getStateCount(total, maCount, feCount);
          statetool.select("#shootings").text(formatAsThousands(c));
        });

      let maOutline = "rgba(32, 196, 166, 0.9)";
      let maFill = "rgba(29, 217, 183, 0.7)";
      let feOutline = "rgba(240, 129, 11, 0.9)";
      let feFill = "rgba(251, 132, 4, 0.7)";
      let naOutline = "rgba(72, 72, 72, 0.9)";
      let naFill = "rgba(87, 87, 87, 0.7)";

      let getRace = function (t) {
        switch (t) {
          case "A":
            return "Asian";
          case "W":
            return "White";
          case "H":
            return "Hispanic";
          case "B":
            return "Black";
          case "N":
            return "NativeAmerican";
          default:
            return "Other";
        }
      };

      v1.append("rect")
        .attr("class", "legend female")
        .attr("fill", feFill)
        .attr("x", v1_w * 0.7)
        .attr("y", v1_h * 0.15)
        .attr("width", 15)
        .attr("height", 15);
      v1.append("text")
        .attr("class", "legend female")
        .attr("x", v1_w * 0.7 + 20)
        .attr("y", v1_h * 0.15 + 12)
        .attr("font-size", "13px")
        .attr("font-family", "sans-serif")
        .text("female");
      v1.append("rect")
        .attr("class", "legend male")
        .attr("fill", maFill)
        .attr("x", v1_w * 0.7 + 75)
        .attr("y", v1_h * 0.15)
        .attr("width", 15)
        .attr("height", 15);
      v1.append("text")
        .attr("class", "legend male")
        .attr("x", v1_w * 0.7 + 95)
        .attr("y", v1_h * 0.15 + 12)
        .attr("font-size", "13px")
        .attr("font-family", "sans-serif")
        .text("male");

      v1.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", (d) => {
          let c = "";
          c += getGender(d.gender);
          c += " ";
          c += getRace(d.race);
          return c;
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
          return getGenderColor(d.gender, maFill, feFill, naFill);
        })
        .attr("stroke", (d) => {
          return getGenderColor(d.gender, maOutline, feOutline, naOutline);
        })
        .attr("opacity", 0.4)
        .style("stroke-width", 0.5)
        .style("cursor", "crosshair")
        .style("visibility", (d) => {
          return isNaN(d.lon) || isNaN(d.lat) ? "hidden" : "visible";
        })
        .on("mouseover", function (event, d) {
          d3.select("#" + d.state + "path")
            .attr("stroke-width", 1.5)
            .attr("fill", "#DEDEDE");

          let statetool = d3.select("#statetooltip");

          let result = json.features.filter((obj) => {
            return obj.properties.abbr == d.state;
          });
          // console.log(result);

          statetool.select("#statename").text(result[0].properties.name);

          let c = getStateCount(
            result[0].properties.value,
            result[0].properties.male,
            result[0].properties.female
          );

          statetool.select("#shootings").text(formatAsThousands(c));

          d3.select(this)
            .transition()
            .duration(100)
            .attr("stroke-width", 0)
            .attr("opacity", 0.8)
            .attr("r", 9);

          let xPosition = parseFloat(d3.select(this).attr("cx")) + 40;
          let yPosition =
            parseFloat(d3.select(this).attr("cy")) + 100 + height_adj;
          // console.log(xPosition, yPosition)

          let toolt = d3
            .select("#tooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px");

          toolt.select("#tooltipname").text(d.name == "" ? "Unknown" : d.name);

          let r = getRace(d.race);
          toolt
            .select("#race")
            .text(() => {
              if (r == "NativeAmerican") {
                return "Native American ";
              }
              if (r == "Other") {
                return "";
              }
              return r + " ";
            })
            .style(
              "color",
              getRaceCol(r == "NativeAmerican" ? "Native American" : r)
            );

          toolt.select("#age").text(isNaN(d.age) ? "?" : d.age);

          toolt.select("#gender").text(getGender(d.gender));

          toolt.select("#date").text(formatDate(d.date));

          d3.select("#tooltip").classed("hidden", false);
        })
        .on("mouseout", function (event, d) {
          d3.select(this)
            .transition()
            .duration(100)
            .attr("stroke-width", 0.5)
            .attr("opacity", 0.4)
            .attr("r", 3);

          d3.select("#" + d.state + "path")
            .attr("stroke-width", 0.5)
            .attr("fill", "#EEE");

          let statetool = d3.select("#statetooltip");

          statetool.select("#statename").text("United States");

          let c = getStateCount(total, maCount, feCount);
          statetool.select("#shootings").text(formatAsThousands(c));

          d3.select("#tooltip").classed("hidden", true);
        });
    });
  });

  let dur = 700;

  let setStateTooltip = function () {
    let statetool = d3.select("#statetooltip");

    statetool.select("#statename").transition().text("United States");

    let old_val = statetool.select("#shootings").text();
    old_val = parseInt(old_val.replace(/,/g, ""));

    let c = total;
    let t = "total";
    let color = "black";
    if (showM && !showF) {
      t = "male";
      c = maCount;
      color = maCol;
    }
    if (showF && !showM) {
      t = "female";
      c = feCount;
      color = feCol;
    }
    statetool
      .select("#shootings")
      .transition()
      .duration(500)
      .tween("text", function (d) {
        let i = d3.interpolateRound(old_val, c);
        return function (t) {
          d3.select(this).text(formatAsThousands(i(t)));
        };
      });
    // .text(formatAsThousands(c));
    statetool.select("#state_gender").text(t).style("color", color);
  };

  let defaultView = function () {
    v1.selectAll("circle").attr("opacity", 0.4).style("visibility", "visible");

    d3.selectAll(".legend").transition().attr("opacity", 1);
  };

  let femaleView = function () {
    // console.log(d3.selectAll("circle.male"))
    d3.selectAll("circle.male")
      .attr("opacity", 0)
      .style("visibility", "hidden");
    d3.selectAll("circle.person")
      .attr("opacity", 0)
      .style("visibility", "hidden");

    d3.selectAll(".legend.female").transition().attr("opacity", 1);
    d3.selectAll(".legend.male").transition().attr("opacity", 0);

    d3.selectAll("circle.female")
      .attr("opacity", 0.4)
      .style("visibility", "visible");
  };

  let maleView = function () {
    // console.log(d3.selectAll("circle.male"))
    d3.selectAll("circle.female")
      .attr("opacity", 0)
      .style("visibility", "hidden");
    d3.selectAll("circle.person")
      .attr("opacity", 0)
      .style("visibility", "hidden");

    d3.selectAll(".legend.male").transition().attr("opacity", 1);
    d3.selectAll(".legend.female").transition().attr("opacity", 0);

    d3.selectAll("circle.male")
      .attr("opacity", 0.4)
      .style("visibility", "visible");
  };

  d3.selectAll("input.genderFilter").on("click", function () {
    let cat = d3.select(this).node().value;

    if (cat == "clear") {
      defaultView();
      showM = true;
      showF = true;
    } else if (cat == "female") {
      femaleView();
      showM = false;
      showF = true;
    } else if (cat == "male") {
      maleView();
      showM = true;
      showF = false;
    }

    setStateTooltip();
  });
});
