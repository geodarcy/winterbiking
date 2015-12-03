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

var currentLayer;

function readData() {
  var url = 'https://geodarcy.cartodb.com/api/v2/sql?format=geojson&q=SELECT * FROM winterbiking WHERE the_geom IS NOT null and updated_at > CURRENT_DATE - 30';
  try {
		$.getJSON(url, function(data) {
			var bikeJson = L.geoJson(data, {
				onEachFeature: initBikeJson
			});
		});
	}
	catch(err) {
		console.log("There are no data yet.");
	}
}

function insertNewLayer(layer) {
  var insertGeoJSON = layer.toGeoJSON();
  var q = 'INSERT INTO winterbiking (the_geom) VALUES (ST_SetSRID(ST_AsText(ST_GeomFromGeoJSON(\'' + JSON.stringify(insertGeoJSON.geometry) + '\')),4326)) RETURNING cartodb_id';
  $.post("./php/callInsertProxy.php", {
    qurl:q,
    cache: false,
    timeStamp: new Date().getTime()
  }, function(data) {
    var foo = JSON.parse(data);
//    console.log(insertGeoJSON);
    insertGeoJSON.properties.cartodb_id = foo.rows[0]["cartodb_id"];
    insertGeoJSON.properties.updated_at = new Date();
    L.geoJson(insertGeoJSON, {
      onEachFeature: function (feature, layer) {
				initBikeJson(feature,layer);
				layer.openPopup();
			}
    });
  });
}

function changeCondition(value) {
  currentLayer.feature.properties.condition = value;
  currentLayer.feature.properties.updated_at = new Date();
  var q = "UPDATE winterbiking SET condition = '" + value + "' WHERE cartodb_id = " + currentLayer.feature.properties.cartodb_id;
  $.post("./php/callInsertProxy.php", {
    qurl:q,
    cache: false,
    timeStamp: new Date().getTime()
  });
  styleMarkers(currentLayer);
	if (currentLayer.feature.geometry.type == "LineString")
    currentLayer.setOpacity({opacity: 1, dashArray: null});
	else if (currentLayer.feature.geometry.type == "Point")
    currentLayer.setOpacity({opacity: 1});
  var popupText = createPopup(currentLayer);
  currentLayer.bindPopup(popupText);
}

function changeComment(value) {
  currentLayer.feature.properties.comment = value;
  currentLayer.feature.properties.updated_at = new Date();
  var q = "UPDATE winterbiking SET comment = '" + value + "' WHERE cartodb_id = " + currentLayer.feature.properties.cartodb_id;
  $.post("./php/callInsertProxy.php", {
    qurl:q,
    cache: false,
    timeStamp: new Date().getTime()
  });
	if (currentLayer.feature.geometry.type == "LineString")
    currentLayer.setOpacity({opacity: 1, dashArray: null});
	else if (currentLayer.feature.geometry.type == "Point")
    currentLayer.setOpacity({opacity: 1});
  var popupText = createPopup(currentLayer);
  currentLayer.bindPopup(popupText);
}

function changeCreator(value) {
  currentLayer.feature.properties.creator = value;
  currentLayer.feature.properties.updated_at = new Date();
  var q = "UPDATE winterbiking SET creator = '" + value + "' WHERE cartodb_id = " + currentLayer.feature.properties.cartodb_id;
  $.post("./php/callInsertProxy.php", {
    qurl:q,
    cache: false,
    timeStamp: new Date().getTime()
  });
	if (currentLayer.feature.geometry.type == "LineString")
    currentLayer.setOpacity({opacity: 1, dashArray: null});
	else if (currentLayer.feature.geometry.type == "Point")
    currentLayer.setOpacity({opacity: 1});
  var popupText = createPopup(currentLayer);
  currentLayer.bindPopup(popupText);
}

function createPopup(layer) {
  var myLayer = layer;
  var popupText = "Condition: <select id='condition' onchange='changeCondition(this.value)'>";
  if (!layer.feature.properties.condition)
    popupText += "<option disabled selected='selected'>Select a riding condition</option><option";
  else
    popupText += "<option";
  if (layer.feature.geometry.type == "LineString") {
    if (layer.feature.properties.condition == 'Good')
      popupText += " selected='selected' ";
    popupText += ">Good</option><option";
    if (layer.feature.properties.condition == 'Fair')
      popupText += " selected='selected' ";
    popupText += ">Fair</option><option";
    if (layer.feature.properties.condition == 'Poor')
      popupText += " selected='selected' ";
    popupText += ">Poor</option></select></br>";
  }
  if (layer.feature.geometry.type == "Point") {
    if (layer.feature.properties.condition == 'Caution')
      popupText += " selected='selected' ";
    popupText += ">Caution</option><option";
    if (layer.feature.properties.condition == 'Hazard')
      popupText += " selected='selected' ";
    popupText += ">Hazard</option></select></br>";
  }
  popupText += "Comment: <textarea onchange='changeComment(this.value)' tabindex='1'>" + layer.feature.properties.comment + "</textarea><br>";
  popupText += "Created By: <textarea onchange='changeCreator(this.value)' tabindex='2'>" + layer.feature.properties.creator + "</textarea><br>";
  popupText += "Updated On: <b>" + layer.feature.properties.updated_at.toDateString() + "</b>";
  return popupText;
}

function initBikeJson (feature, layer) {
  var tempLayer = layer;
  tempLayer.feature = layer.feature;
//  console.log(tempLayer);
  tempLayer.feature.properties.updated_at = new Date(tempLayer.feature.properties.updated_at);
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
    if (layer.feature.geometry.type == "LineString" & layer.feature.properties.condition == "Poor")
      layer.setStyle({color: "#ff0000"});
    if (layer.feature.geometry.type == "LineString" & layer.feature.properties.condition == "Fair")
      layer.setStyle({color: "#EE9D08"});
    if (layer.feature.geometry.type == "LineString" & layer.feature.properties.condition == "Good")
      layer.setStyle({color: "#0F7001"});
    if (layer.feature.geometry.type == "Point" & layer.feature.properties.condition == "Hazard")
      layer.setIcon(hazardIcon);
    if (layer.feature.geometry.type == "Point" & layer.feature.properties.condition == "Caution")
      layer.setIcon(cautionIcon);
  }
}

function fadeOldLines (layer) {
//  console.log(layer.feature);
  if (layer.feature) {
    var editedDate = new Date(layer.feature.properties.updated_at);
    var today = new Date();
    var timeDiff = Math.abs(editedDate.getTime() - today.getTime());
    var daysDiff = timeDiff / (1000 * 3600 * 24);
		var dashString = "15"
		for (i=1; i<daysDiff; i++) {
			dashString += ",10,2";
		}
		dashString += ",10"
		if (daysDiff >= 1) {
		  layer.setStyle({dashArray: dashString});
	  }
		layer.setStyle({opacity: (30-daysDiff)/30});
/*    if (daysDiff <= 7)
      layer.setStyle({opacity: 1});
    else if (daysDiff <= 14)
      layer.setStyle({opacity: 0.5});
    else if (daysDiff <= 21)
      layer.setStyle({opacity: 0.25});
    else
      layer.setStyle({opacity: 0.1}); */
  }
}

function fadeOldPoints (layer) {
  if (layer.feature) {
    var editedDate = new Date(layer.feature.properties.updated_at);
    var today = new Date();
    var timeDiff = Math.abs(editedDate.getTime() - today.getTime());
    var daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  //  console.log(daysDiff);
    layer.setOpacity((30-daysDiff)/30);
  }
}

function geolocateMe() {
  if (geoPosition.init()) {
    geoPosition.getCurrentPosition(geoSuccess, geoError);
  }
}

function geoSuccess(p) {
  map.panTo([p.coords.latitude, p.coords.longitude]);
  geolocateMarker = new L.marker([p.coords.latitude, p.coords.longitude]).addTo(map);
	geolocateMarker.bindPopup('You may be here').openPopup();
}

function geoError() {
  alert("Sorry, couldn't find you!");
}

function deleteLayers(layer) {
  drawnItems.removeLayer(layer);
  var q = "DELETE FROM winterbiking WHERE cartodb_id = " + layer.feature.properties.cartodb_id;
  $.post("./php/callInsertProxy.php", {
    qurl:q,
    cache: false,
    timeStamp: new Date().getTime()
  });
}

function editLayers(layer) {
  var editGeoJSON = layer.toGeoJSON();
  var q = 'UPDATE winterbiking SET the_geom = (ST_SetSRID(ST_AsText(ST_GeomFromGeoJSON(\'' + JSON.stringify(editGeoJSON.geometry) + '\')),4326)) WHERE cartodb_id = ' + layer.feature.properties.cartodb_id;
  $.post("./php/callInsertProxy.php", {
    qurl:q,
    cache: false,
    timeStamp: new Date().getTime()
  });
}

function showAllDataFcn() {
	map.fitBounds(drawnItems.getBounds());
}

function addSegment() {
	var q = 'INSERT INTO wbstrava (segment_id) VALUES (' + document.getElementById("segmentID").value + ')';
  $.post("../php/callInsertProxy.php", {
    qurl:q,
    cache: false,
    timeStamp: new Date().getTime()
  });
}