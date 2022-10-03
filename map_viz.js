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
let v2 = d3
  .select("svg")
  .append("g")
  .attr("id", "v2")
  .attr("transform", "translate(" + v1_w + ", 0)");
let v3 = d3
  .select("svg")
  .append("g")
  .attr("id", "v3")
  .attr("transform", "translate(" + v1_w + "," + v2_h + ")");

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

  // 'A', 'W', 'H', 'B', 'O', '', 'N'
  let data_by_year = [];
  for (let i = 2015; i <= 2021; i++) {
    let year_item = {
      year: i,
      Asian: { female: 0, male: 0, person: 0, total: 0 },
      White: { female: 0, male: 0, person: 0, total: 0 },
      Hispanic: { female: 0, male: 0, person: 0, total: 0 },
      Black: { female: 0, male: 0, person: 0, total: 0 },
      NativeAmerican: { female: 0, male: 0, person: 0, total: 0 },
      Other: { female: 0, male: 0, person: 0, total: 0 },
    };
    data_by_year.push(year_item);
  }

  for (let i = 0; i < data.length; i++) {
    let index = data[i].date.getFullYear() - 2015;
    // console.log(index);
    switch (data[i].race) {
      case "A":
        data_by_year[index].Asian.total++;
        data_by_year[index].Asian[getGender(data[i].gender)]++;
        break;
      case "W":
        data_by_year[index].White.total++;
        data_by_year[index].White[getGender(data[i].gender)]++;
        break;
      case "H":
        data_by_year[index].Hispanic.total++;
        data_by_year[index].Hispanic[getGender(data[i].gender)]++;
        break;
      case "B":
        data_by_year[index].Black.total++;
        data_by_year[index].Black[getGender(data[i].gender)]++;
        break;
      case "N":
        data_by_year[index].NativeAmerican.total++;
        data_by_year[index].NativeAmerican[getGender(data[i].gender)]++;
        break;
      default:
        data_by_year[index].Other.total++;
        data_by_year[index].Other[getGender(data[i].gender)]++;
        break;
    }
  }

  data_by_year.pop();
  // console.log(data_by_year);

  // let popConverter = function(d) {
  //   return {
  //     year: parseInt(d.year),
  //     Asian: parseFloat(d.Asian),
  //     White: parseFloat(d.White),
  //     Hispanic: parseFloat(d.Hispanic),
  //     NativeAmerican: parseFloat(d.NativeAmerican),
  //     Black: parseFloat(d.Black)
  //   };
  // }

  // d3.csv("US-population.csv", popConverter).then( (popData)=> {
  //   for (let i = 0; i < popData.length; i++) {
  //     data_by_year[i].Asian /= popData[i].Asian;
  //     data_by_year[i].White /= popData[i].White;
  //     data_by_year[i].Hispanic /= popData[i].Hispanic;
  //     data_by_year[i].NativeAmerican /= popData[i].NativeAmerican;
  //     data_by_year[i].Black /= popData[i].Black;
  //   };
  //   console.log(data_by_year);

  let xScale2 = d3
    .scalePoint()
    .domain([2015, 2016, 2017, 2018, 2019, 2020])
    .range([padding, v2_w - padding])
    .padding(0.1);

  let yScale2 = d3
    .scaleLinear()
    .domain([0, 525])
    .range([v2_h - padding, padding]);

  const xAxis2 = d3.axisBottom().scale(xScale2).ticks(6);

  const yAxis2 = d3.axisLeft().scale(yScale2).ticks(10);

  v2.append("text")
    .attr("class", "chart_title")
    .attr("font-size", "20px")
    .attr("font-family", "sans-serif")
    .attr("x", 0)
    .attr("y", padding * 0.5)
    .text("Shootings by Race, 2015-2020");

  for (let k = 0; k < races.length; k++) {
    v2.append("rect")
      .attr("class", "legend " + races[k].replace(/\s/g, ""))
      .attr("width", 10)
      .attr("height", 10)
      .attr("x", v2_w - (padding * 2) / 3)
      .attr("y", padding + k * 14)
      .attr("fill", race_cols[k])
      .attr("stroke", "none");
    v2.append("text")
      .attr("class", "legend " + races[k].replace(/\s/g, ""))
      .attr("x", v2_w - (padding * 2) / 3 + 14)
      .attr("y", padding + k * 14 + 10)
      .attr("fill", "black")
      .attr("font-size", 12)
      .attr("font-family", "sans-serif")
      .text(races[k]);

    let line_ends = [];
    for (let l = 0; l < data_by_year.length - 1; l++) {
      let segment = {
        year1: data_by_year[l].year,
        year2: data_by_year[l + 1].year,
        n1: data_by_year[l][races[k].replace(/\s/g, "")].total,
        n2: data_by_year[l + 1][races[k].replace(/\s/g, "")].total,
        fn1: data_by_year[l][races[k].replace(/\s/g, "")].female,
        fn2: data_by_year[l + 1][races[k].replace(/\s/g, "")].female,
        mn1: data_by_year[l][races[k].replace(/\s/g, "")].male,
        mn2: data_by_year[l + 1][races[k].replace(/\s/g, "")].male,
      };
      line_ends.push(segment);
    }

    v2.selectAll("line." + races[k])
      .data(line_ends)
      .enter()
      .append("line")
      .attr("class", races[k].replace(/\s/g, ""))
      .attr("x1", (d) => {
        return xScale2(d.year1);
      })
      .attr("x2", (d) => {
        return xScale2(d.year2);
      })
      .attr("y1", (d) => {
        return yScale2(d.n1);
      })
      .attr("y2", (d) => {
        return yScale2(d.n2);
      })
      .attr("stroke-width", 2.5)
      .attr("stroke", race_cols[k])
      .attr("fill", "none")
      .attr("opacity", 1)
      .append("title")
      .text(races[k]);

    v2.selectAll("circle." + races[k].replace(/\s/g, ""))
      .data(data_by_year)
      .enter()
      .append("circle")
      .attr("class", races[k].replace(/\s/g, ""))
      .attr("cx", (d) => {
        return xScale2(d.year);
      })
      .attr("cy", (d) => {
        return yScale2(d[races[k].replace(/\s/g, "")].total);
      })
      .attr("r", 3)
      .attr("stroke", "#444")
      .attr("fill", race_cols[k])
      .attr("opacity", 1)
      .style("cursor", "crosshair")
      .on("mouseover", function (event, d) {
        let xPosition = parseFloat(d3.select(this).attr("cx")) + v1_w + 30;
        let yPosition =
          parseFloat(d3.select(this).attr("cy")) + padding + 80 + height_adj;
        // console.log(xPosition, yPosition);

        let toolt = d3
          .select("#tooltip2")
          .style("left", xPosition + "px")
          .style("top", yPosition + "px");

        let deaths = 0;
        if (showF && showM) {
          deaths = d[races[k].replace(/\s/g, "")].total;
        } else if (showM) {
          deaths = d[races[k].replace(/\s/g, "")].male;
        } else {
          deaths = d[races[k].replace(/\s/g, "")].female;
        }

        toolt.select("#num").text(deaths);

        toolt.select("#racial").text(races[k]).style("color", race_cols[k]);

        toolt.select("#year").text(d.year);

        d3.select("#tooltip2").classed("hidden", false);
      })
      .on("mouseout", function () {
        d3.select("#tooltip2").classed("hidden", true);
      });
  }

  v2.append("g")
    .attr("class", "x axis")
    .style("font-size", "12px")
    .attr("transform", "translate(0," + (v2_h - padding) + ")")
    .call(xAxis2);
  v2.append("g")
    .attr("class", "y axis")
    .style("font-size", "12px")
    .attr("transform", "translate(" + padding + ", 0)")
    .call(yAxis2);

  v2.append("text")
    .attr("class", "x axis label")
    .attr("font-size", "14px")
    .attr("font-family", "sans-serif")
    .attr("x", v2_w)
    .attr("y", v2_h - padding + 20)
    .attr("text-anchor", "middle")
    .text("(year)");

  let data_by_age = [];
  for (let k = 0; k < 9; k++) {
    let age_item = {
      age: 9 + k * 10,
      female: 0,
      male: 0,
      person: 0,
    };
    data_by_age.push(age_item);
  }

  for (let k = 0; k < data.length; k++) {
    if (data[k].age < 9) {
      data_by_age[0][getGender(data[k].gender)]++;
    } else if (data[k].age < 19) {
      data_by_age[1][getGender(data[k].gender)]++;
    } else if (data[k].age < 29) {
      data_by_age[2][getGender(data[k].gender)]++;
    } else if (data[k].age < 39) {
      data_by_age[3][getGender(data[k].gender)]++;
    } else if (data[k].age < 49) {
      data_by_age[4][getGender(data[k].gender)]++;
    } else if (data[k].age < 59) {
      data_by_age[5][getGender(data[k].gender)]++;
    } else if (data[k].age < 69) {
      data_by_age[6][getGender(data[k].gender)]++;
    } else if (data[k].age < 79) {
      data_by_age[7][getGender(data[k].gender)]++;
    } else if (data[k].age >= 80) {
      data_by_age[8][getGender(data[k].gender)]++;
    }
  }
  // console.log(data_by_age);

  let age_groups = [
    "0-9",
    "10-19",
    "20-29",
    "30-39",
    "40-49",
    "50-59",
    "60-69",
    "70-79",
    "80+",
  ];

  let xScale3 = d3
    .scaleBand()
    .domain(age_groups)
    .range([padding, v2_w - padding])
    .paddingInner(0.35)
    .paddingOuter(0.3);

  let yScale3 = d3
    .scaleLinear()
    .domain([0, 2100])
    .range([v3_h - padding, padding]);

  const xAxis3 = d3.axisBottom().scale(xScale3).ticks(9);

  const yAxis3 = d3.axisLeft().scale(yScale3).ticks(10);

  v3.append("text")
    .attr("x", 0)
    .attr("y", padding / 2)
    .attr("font-size", "20px")
    .attr("font-family", "sans-serif")
    .text("Shootings by Age Group & Gender");

  let genders = ["female", "male"];
  let gender_cols = [feCol, maCol];
  for (let k = 0; k < 2; k++) {
    v3.append("rect")
      .attr("class", "legend " + genders[k])
      .attr("width", 10)
      .attr("height", 10)
      .attr("x", v2_w - (padding * 2) / 3)
      .attr("y", padding + k * 14)
      .attr("fill", gender_cols[k]);
    v3.append("text")
      .attr("class", "legend " + genders[k])
      .attr("font-size", 12)
      .attr("font-family", "sans-serif")
      .attr("x", v2_w - (padding * 2) / 3 + 14)
      .attr("y", padding + k * 14 + 10)
      .text(genders[k]);
  }

  v3.selectAll("rect.male")
    .data(data_by_age)
    .enter()
    .append("rect")
    .attr("class", "male data")
    .attr("x", (d) => {
      if (d.age >= 80) {
        return xScale3("80+");
      }
      let grp = d.age - 9 + "-" + d.age;
      return xScale3(grp);
    })
    .attr("y", (d) => {
      return yScale3(d.male);
    })
    .attr("width", (d) => {
      return xScale3.bandwidth();
    })
    .attr("height", (d) => {
      return v3_h - padding - yScale3(d.male);
    })
    .attr("fill", maCol)
    .style("cursor", "crosshair")
    .on("mousemove", function (event, d) {
      let here = d3.pointer(event);
      let xPosition = here[0] + v1_w + 30;
      let yPosition = here[1] + v2_h + 110 + height_adj;

      let toolt = d3
        .select("#tooltip3")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px");

      let grp;
      if (d.age >= 80) {
        grp = "80+";
      } else {
        grp = d.age - 9 + "-" + d.age;
      }

      toolt.select("#agegroup").text(grp);

      toolt.select("#gendergroup").text("Male").style("color", maCol);

      toolt.select("#cases").text(formatAsThousands(d.male));

      d3.select("#tooltip3").classed("hidden", false);
    })
    .on("mouseout", function () {
      d3.select("#tooltip3").classed("hidden", true);
    });

  v3.selectAll("rect.female")
    .data(data_by_age)
    .enter()
    .append("rect")
    .attr("class", "female data")
    .attr("x", (d) => {
      if (d.age >= 80) {
        return xScale3("80+");
      }
      let grp = d.age - 9 + "-" + d.age;
      return xScale3(grp);
    })
    .attr("y", (d) => {
      return yScale3(d.male + d.female);
    })
    .attr("width", (d) => {
      return xScale3.bandwidth();
    })
    .attr("height", (d) => {
      return v3_h - padding - yScale3(d.female);
    })
    .attr("fill", feCol)
    .style("cursor", "crosshair")
    .on("mousemove", function (event, d) {
      let here = d3.pointer(event);
      let xPosition = here[0] + v1_w + 30;
      let yPosition = here[1] + v2_h + 110 + height_adj;
      // console.log(xPosition, yPosition)

      let toolt = d3
        .select("#tooltip3")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px");

      let grp;
      if (d.age >= 80) {
        grp = "80+";
      } else {
        grp = d.age - 9 + "-" + d.age;
      }

      toolt.select("#agegroup").text(grp);

      toolt.select("#gendergroup").text("Female").style("color", feCol);

      toolt.select("#cases").text(formatAsThousands(d.female));

      d3.select("#tooltip3").classed("hidden", false);
    })
    .on("mouseout", function () {
      d3.select("#tooltip3").classed("hidden", true);
    });

  v3.append("g")
    .attr("class", "x axis")
    .style("font-size", "12px")
    .attr("transform", "translate(0," + (v3_h - padding) + ")")
    .call(xAxis3);

  v3.append("g")
    .attr("class", "y axis")
    .style("font-size", "12px")
    .attr("transform", "translate(" + padding + ", 0)")
    .call(yAxis3);

  v3.append("text")
    .attr("class", "x axis label")
    .attr("font-size", "14px")
    .attr("font-family", "sans-serif")
    .attr("x", v2_w / 2)
    .attr("y", v3_h - 5)
    .attr("text-anchor", "middle")
    .text("Age group");

  // });

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

    yScale2.domain([0, 525]);
    v2.selectAll("line")
      .transition()
      .duration(dur)
      .attr("x1", (d) => {
        return xScale2(d.year1);
      })
      .attr("x2", (d) => {
        return xScale2(d.year2);
      })
      .attr("y1", (d) => {
        return yScale2(d.n1);
      })
      .attr("y2", (d) => {
        return yScale2(d.n2);
      });

    for (let k = 0; k < races.length; k++) {
      v2.selectAll("circle." + races[k].replace(/\s/g, ""))
        .transition()
        .duration(dur)
        .attr("cx", (d) => {
          return xScale2(d.year);
        })
        .attr("cy", (d) => {
          return yScale2(d[races[k].replace(/\s/g, "")].total);
        });
    }
    v2.select(".y.axis").transition().duration(dur).call(yAxis2);

    yScale3.domain([0, 2100]);
    v3.selectAll("rect.male.data")
      .transition()
      .duration(dur)
      .delay(dur)
      .attr("y", (d) => {
        return yScale3(d.male);
      })
      .attr("height", (d) => {
        return v3_h - padding - yScale3(d.male);
      });

    v3.selectAll("rect.female.data")
      .transition()
      .duration(dur)
      .delay(dur)
      .attr("y", (d) => {
        return yScale3(d.male + d.female);
      })
      .attr("height", (d) => {
        return v3_h - padding - yScale3(d.female);
      });
    v3.select(".y.axis").transition().duration(dur).delay(dur).call(yAxis3);
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

    yScale2.domain([
      0,
      d3.max(data_by_year, (d) => {
        return Math.max(
          d.Asian.female,
          d.White.female,
          d.Black.female,
          d.Hispanic.female,
          d.NativeAmerican.female
        );
      }),
    ]);
    v2.selectAll("line")
      .transition()
      .duration(dur)
      .attr("x1", (d) => {
        return xScale2(d.year1);
      })
      .attr("x2", (d) => {
        return xScale2(d.year2);
      })
      .attr("y1", (d) => {
        return yScale2(d.fn1);
      })
      .attr("y2", (d) => {
        return yScale2(d.fn2);
      });
    for (let k = 0; k < races.length; k++) {
      v2.selectAll("circle." + races[k].replace(/\s/g, ""))
        .transition()
        .duration(dur)
        .attr("cx", (d) => {
          return xScale2(d.year);
        })
        .attr("cy", (d) => {
          return yScale2(d[races[k].replace(/\s/g, "")].female);
        });
    }
    v2.select(".y.axis").transition().duration(dur).call(yAxis2);

    yScale3.domain([
      0,
      5 +
        d3.max(data_by_age, (d) => {
          return d.female;
        }),
    ]);
    v3.selectAll("rect.male.data")
      .transition()
      .duration(dur)
      .delay(dur)
      .attr("y", v3_h - padding)
      .attr("height", 0);
    v3.selectAll("rect.female.data")
      .transition()
      .duration(dur)
      .delay(dur)
      .attr("height", (d) => {
        return v3_h - padding - yScale3(d.female);
      })
      .attr("y", (d) => {
        return yScale3(d.female);
      });
    v3.select(".y.axis").transition().duration(dur).delay(dur).call(yAxis3);

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

    yScale2.domain([
      0,
      50 +
        d3.max(data_by_year, (d) => {
          return Math.max(
            d.Asian.male,
            d.White.male,
            d.Black.male,
            d.Hispanic.male,
            d.NativeAmerican.male
          );
        }),
    ]);
    v2.selectAll("line")
      .transition()
      .duration(dur)
      .attr("x1", (d) => {
        return xScale2(d.year1);
      })
      .attr("x2", (d) => {
        return xScale2(d.year2);
      })
      .attr("y1", (d) => {
        return yScale2(d.mn1);
      })
      .attr("y2", (d) => {
        return yScale2(d.mn2);
      });
    for (let k = 0; k < races.length; k++) {
      v2.selectAll("circle." + races[k].replace(/\s/g, ""))
        .transition()
        .duration(dur)
        .attr("cx", (d) => {
          return xScale2(d.year);
        })
        .attr("cy", (d) => {
          return yScale2(d[races[k].replace(/\s/g, "")].male);
        });
    }
    v2.select(".y.axis").transition().duration(dur).call(yAxis2);

    yScale3.domain([
      0,
      5 +
        d3.max(data_by_age, (d) => {
          return d.male;
        }),
    ]);
    v3.selectAll("rect.female.data")
      .transition()
      .duration(dur)
      .delay(dur)
      .attr("y", v3_h - padding)
      .attr("height", 0);
    v3.selectAll("rect.male.data")
      .transition()
      .duration(dur)
      .delay(dur)
      .attr("height", (d) => {
        return v3_h - padding - yScale3(d.male);
      })
      .attr("y", (d) => {
        return yScale3(d.male);
      });
    v3.select(".y.axis").transition().duration(dur).delay(dur).call(yAxis3);

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
