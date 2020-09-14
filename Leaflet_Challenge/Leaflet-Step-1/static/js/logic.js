// Store API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Do a get request to the query URL
d3.json(queryUrl, function (data) {
  console.log("data", data)

// Send the data.features object to the createFeatures function after getting the response
  createFeatures(data.features);
  console.log("data.features", data.features)
});

var colors = ["#a1e8af", "#94c595", "#747c92", "#372772", "#3a2449", "#f19c79",
  "#a44a3f"]

var quakeDivision = [1,2,3, 3.5, 4, 5, 6];

var quakeLabels = ["0 - 1",  "1 - 2", "2 - 3", "3 - 3.5", "3.5 - 4", "4 - 5", "5 - 6", ">6"]

function selectColor(mag) {
  switch (true) {
    case (mag < 1):
      bubbleColor = colors[0]
      break;
    case (mag < 2):
      bubbleColor = colors[1]
      break;
    case (mag < 3):
      bubbleColor = colors[2]
      break;
    case (mag < 3.5):
      bubbleColor = colors[3]
      break;
    case (mag < 4):
      bubbleColor = colors[4]
      break;
    case (mag < 5):
      bubbleColor = colors[5]
      break;
    default:
      bubbleColor = colors[6]
  }
  return (bubbleColor)
}

function createFeatures(earthquakeData) {

  // Function for each feature in the features array
  // Give a popup that describe the place and time of the earthquake
  function onEachFeature(feature, layer) {
    console.log("feature", feature)
    console.log("layer", layer)
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) +
      "</p><p>Magnitude:" + feature.properties.mag);
  }
  console.log(onEachFeature)
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      var geojsonMarkerOptions = {
        radius: feature.properties.mag * 5,
        fillColor: selectColor(feature.properties.mag),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });

  console.log("earthquakes", earthquakes)
  // Sending earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define variables for our base layers
  var streetmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: 'mapbox/streets-v11',
    accessToken: API_KEY
  })

  var darkmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: 'mapbox/dark-v10',
    accessToken: API_KEY
  })

  // BaseMaps object to hold base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");
    var limits = earthquakes.properties;
//    var colors = earthquakes.options.colors;
    var labels = [];

    // Add min & max
    var legendInfo = "<h1>Magnitude</h1>";

    div.innerHTML = legendInfo;
console.log("limits", limits)
    colors.forEach(function(d, index) {
 //     labels.push("<p><li style=\"background-color: " + colors[index] + "\"></li>" + quakeLabels[index] +"</p>");
      labels.push("<li style=\"background-color:" + colors[index] + "\"></li><span>"
      + quakeLabels[index] +"</span><br>" )
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };
  // Create map with streetmap earthquakes layers
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });
  legend.addTo(myMap)

  // Create a layer control, pass baseMaps and overlayMaps and add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}