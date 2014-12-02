var cautionIcon = L.icon({
  iconUrl: './icons/caution.png',
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  popupAnchor: [-3, -15]
});

var hazardIcon = L.icon({
  iconUrl: './icons/hazard.png',
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  popupAnchor: [-3, -15]
});

var currentLayer, jsonData;

function readData() {
  try {
		$.get("./data/winterbiking.geojson", function(data, status) {
			bikeEdits = JSON.parse(data);
			bikeJson = L.geoJson(bikeEdits, {
				onEachFeature: initBikeJson
			});
		});
	}
	catch(err) {
	  console.log("There are no data yet.");
	}
}

function writeData(callbackFunction) {
  jsonData = JSON.stringify(drawnItems.toGeoJSON());
//  console.log(jsonData);
  callbackFunction();
}

function changeCondition(value) {
  currentLayer.feature.properties.Condition = value;
  currentLayer.feature.properties.last_edited_date = new Date();
  updateAllMarkers();
}

function changeComment(value) {
  currentLayer.feature.properties.Comment = value;
  currentLayer.feature.properties.last_edited_date = new Date();
  updateAllMarkers();
}

function changeCreator(value) {
  currentLayer.feature.properties.created_user = value;
  currentLayer.feature.properties.last_edited_date = new Date();
  updateAllMarkers();
}

function updateAllMarkers() {
  drawnItems.eachLayer(function(layer) {
    styleMarkers(layer);
    if (layer.feature.geometry.type == "LineString")
      fadeOldLines(layer);
		if (layer.feature.geometry.type == "Point")
			fadeOldPoints(layer);
    var popupText = createPopup(layer);
    layer.bindPopup(popupText);
  });
  jsonData = JSON.stringify(drawnItems.toGeoJSON());
//  console.log(jsonData);
  writeData(function() {
		$.post("./php/writewbjson.php", 'data='+jsonData, function(){pass/*drawnItems.clearLayers();readData();*/});
	});
}

function createPopup(layer) {
  var myLayer = layer;
  var popupText = "Condition: <select id='condition' onchange='changeCondition(this.value)'>";
  if (!layer.feature.properties.Condition)
    popupText += "<option disabled selected='selected'>Select a riding condition</option><option";
  else
    popupText += "<option";
  if (layer.feature.geometry.type == "LineString") {
    if (layer.feature.properties.Condition == 'Good')
      popupText += " selected='selected' ";
    popupText += ">Good</option><option";
    if (layer.feature.properties.Condition == 'Fair')
      popupText += " selected='selected' ";
    popupText += ">Fair</option><option";
    if (layer.feature.properties.Condition == 'Poor')
      popupText += " selected='selected' ";
    popupText += ">Poor</option></select></br>";
  }
  if (layer.feature.geometry.type == "Point") {
    if (layer.feature.properties.Condition == 'Caution')
      popupText += " selected='selected' ";
    popupText += ">Caution</option><option";
    if (layer.feature.properties.Condition == 'Hazard')
      popupText += " selected='selected' ";
    popupText += ">Hazard</option></select></br>";
  }
  popupText += "Comment: <textarea onchange='changeComment(this.value)' tabindex='1'>" + layer.feature.properties.Comment + "</textarea><br>";
  popupText += "Created By: <textarea onchange='changeCreator(this.value)' tabindex='2'>" + layer.feature.properties.created_user + "</textarea><br>";
  popupText += "Created On: <b>" + layer.feature.properties.last_edited_date.toDateString() + "</b>";
  return popupText;
}

function initBikeJson (feature, layer) {
  var tempLayer = layer;
  tempLayer.feature = layer.feature;
//  console.log(tempLayer);
  tempLayer.feature.properties.last_edited_date = new Date(tempLayer.feature.properties.last_edited_date);
  var popupText = createPopup(tempLayer);
  tempLayer.bindPopup(popupText);
  tempLayer.on('popupopen', function(){currentLayer = tempLayer;});
  styleMarkers(tempLayer);
  if (tempLayer.feature.geometry.type == "LineString")
    fadeOldLines(tempLayer);
  if (tempLayer.feature.geometry.type == "Point")
    fadeOldPoints(tempLayer);
  drawnItems.addLayer(tempLayer);
}

function styleMarkers (layer) {
//  console.log(layer);
  if (layer.feature) {
    if (layer.feature.geometry.type == "LineString" & layer.feature.properties.Condition == "Poor")
      layer.setStyle({color: "#ff0000"});
    if (layer.feature.geometry.type == "LineString" & layer.feature.properties.Condition == "Fair")
      layer.setStyle({color: "#f7f619"});
    if (layer.feature.geometry.type == "LineString" & layer.feature.properties.Condition == "Good")
      layer.setStyle({color: "green"});
    if (layer.feature.geometry.type == "Point" & layer.feature.properties.Condition == "Hazard")
      layer.setIcon(hazardIcon);
    if (layer.feature.geometry.type == "Point" & layer.feature.properties.Condition == "Caution")
      layer.setIcon(cautionIcon);
  }
}

function fadeOldLines (layer) {
//  console.log(layer.feature);
  if (layer.feature) {
    var editedDate = new Date(layer.feature.properties.last_edited_date);
    var today = new Date();
    var timeDiff = Math.abs(editedDate.getTime() - today.getTime());
    var daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  //  console.log(daysDiff);
    if (daysDiff <= 7)
      layer.setStyle({opacity: 1});
    else if (daysDiff <= 14)
      layer.setStyle({opacity: 0.5});
    else if (daysDiff <= 21)
      layer.setStyle({opacity: 0.25});
    else
      layer.setStyle({opacity: 0.1});
  }
}

function fadeOldPoints (layer) {
  if (layer.feature) {
    var editedDate = new Date(layer.feature.properties.last_edited_date);
    var today = new Date();
    var timeDiff = Math.abs(editedDate.getTime() - today.getTime());
    var daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  //  console.log(daysDiff);
    if (daysDiff <= 7)
      layer.setOpacity(1);
    else if (daysDiff <= 14)
      layer.setOpacity(0.5);
    else if (daysDiff <= 21)
      layer.setOpacity(0.25);
    else
      layer.setOpacity(0.1);
  }
}

function initNewLayer(layer) {
  var layerGeoJSON = layer.toGeoJSON()
  layerGeoJSON.properties.last_edited_date = new Date();
  var layerGeoJSONNewClass = L.geoJson(layerGeoJSON)
  var layerForDrawnItems = layerGeoJSONNewClass._layers[Object.keys(layerGeoJSONNewClass._layers)[0]]
  var popupText = createPopup(layerForDrawnItems);
  layerForDrawnItems.bindPopup(popupText);
  currentLayer = layerForDrawnItems;
  drawnItems.addLayer(layerForDrawnItems);
  drawnItems._layers[Object.keys(drawnItems._layers)[Object.keys(drawnItems._layers).length - 1]].openPopup()
//  console.log(layerGeoJSONNewClass._layers[Object.keys(layerGeoJSONNewClass._layers)[0]]);
}

function geolocateMe() {
  var pos = L.GeoIP.getPosition();
  map.panTo([pos.lat, pos.lng]);
	geolocateMarker = new L.marker([pos.lat, pos.lng]).addTo(map);
	geolocateMarker.bindPopup('You may be here').openPopup();
}