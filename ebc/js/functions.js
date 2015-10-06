var currentLayer;

function readData() {
  var url = 'https://geodarcy.cartodb.com/api/v2/sql?format=geojson&q=SELECT * FROM ebcplanning';
  try {
		$.getJSON(url, function(data) {
			var readLayer = L.geoJson(data, {
				onEachFeature: function (feature, layer) {
					layer.feature.properties.updated_at = new Date(layer.feature.properties.updated_at);
					var popupText = createPopup(layer);
					layer.bindPopup(popupText);
					layer.on('popupopen', function(){currentLayer = layer;});
					styleMarkers(layer);
				  bikeJson.addLayer(layer);
				}
			});
		});
	}
	catch(err) {
		console.log("There are no data yet.");
	}
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
}

function createPopup(layer) { // needs to be edited
  var myLayer = layer;
  var popupText = "Type Of Infrastructure: <strong>" + layer.feature.properties.type + "</strong></br>";

  popupText += "Quality Of Infrastructure: <strong>" + layer.feature.properties.quality + "</strong></br>";

  popupText += "Political Cost: <strong>" + layer.feature.properties.policost + "</strong></br>";

  popupText += "Location: <strong>" + layer.feature.properties.location + "</strong></br>";
  popupText += "Comments: <strong>" + layer.feature.properties.comments + "</strong></br>";
  popupText += "Image: <strong>" + layer.feature.properties.image + "</strong></br>";
	return popupText;
}

function createEditablePopup(layer) { // needs to be edited
//  var myLayer = layer;
console.log(layer);
  var popupText = "Type Of Infrastructure: <select id='type' onchange='changeValue(this.value, this.id)'>";
  if (!layer.feature.properties.type)
    popupText += "<option disabled selected='selected'>Select Type Of Infrastructure</option><option";
  else
    popupText += "<option";
  if (layer.feature.properties.type == 'Connection')
    popupText += " selected='selected' ";
  popupText += ">Connection</option><option";
  if (layer.feature.properties.type == 'Major route')
    popupText += " selected='selected' ";
  popupText += ">Major route</option><option";
  if (layer.feature.properties.type == 'Improvement to existing infrastructure')
    popupText += " selected='selected' ";
  popupText += ">Improvement to existing infrastructure</option><option";
  if (layer.feature.properties.type == 'Shortcut though area that is inaccessible to cars')
    popupText += " selected='selected' ";
  popupText += ">Shortcut though area that is inaccessible to cars</option><option";
  if (layer.feature.properties.type == 'Other')
    popupText += " selected='selected' ";
  popupText += ">Other</option></select></br>";

  popupText += "Quality Of Infrastructure: <select id='quality' onchange='changeValue(this.value, this.id)'>";
  if (!layer.feature.properties.quality)
    popupText += "<option disabled selected='selected'>Select Quality Of Infrastructure</option><option";
  else
    popupText += "<option";
  if (layer.feature.properties.quality == 'Separated cycle track')
    popupText += " selected='selected' ";
  popupText += ">Separated cycle track</option><option";
  if (layer.feature.properties.quality == 'Multi-use path')
    popupText += " selected='selected' ";
  popupText += ">Multi-use path</option><option";
  if (layer.feature.properties.quality == 'Traffic-calmed bike boulevard')
    popupText += " selected='selected' ";
  popupText += ">Traffic-calmed bike boulevard</option><option";
  if (layer.feature.properties.quality == 'Other')
    popupText += " selected='selected' ";
  popupText += ">Other</option></select></br>";

  popupText += "Political Cost: <select id='policost' onchange='changeValue(this.value, this.id)'>";
  if (!layer.feature.properties.policost)
    popupText += "<option disabled selected='selected'>Select Political Cost</option><option";
  else
    popupText += "<option";
  if (layer.feature.properties.policost == 'High - severe disruption in driving patterns')
    popupText += " selected='selected' ";
  popupText += ">High - severe disruption in driving patterns</option><option";
  if (layer.feature.properties.policost == 'Medium - moderate disruption')
    popupText += " selected='selected' ";
  popupText += ">Medium - moderate disruption</option><option";
  if (layer.feature.properties.policost == 'Low - the street is overbuilt, low disruption')
    popupText += " selected='selected' ";
  popupText += ">Low - the street is overbuilt, low disruption</option><option";
  if (layer.feature.properties.policost == 'Other')
    popupText += " selected='selected' ";
  popupText += ">Other</option></select></br>";


  popupText += "Location: <textarea id='location' onchange='changeValue(this.value, this.id)' tabindex='1'>" + layer.feature.properties.location + "</textarea><br>";
  popupText += "Comments: <textarea id='comments' onchange='changeValue(this.value, this.id)' tabindex='2'>" + layer.feature.properties.comments + "</textarea><br>";
  popupText += "Image: <textarea id='image' onchange='changeValue(this.value, this.id)' tabindex='3'>" + layer.feature.properties.image + "</textarea><br>";
	return popupText;
}

function styleMarkers (layer) { // needs to be edited
//  console.log(layer);
  if (layer.feature) {
    if (layer.feature.properties.policost == "High - severe disruption in driving patterns")
      layer.setStyle({color: "#ff0000"});
    if (layer.feature.properties.policost == "Medium - moderate disruption")
      layer.setStyle({color: "#EE9D08"});
    if (layer.feature.properties.policost == "Low - the street is overbuilt, low disruption")
      layer.setStyle({color: "#0F7001"});
  }
}

function insertNewLayer(layer) { // needs to be edited
  var insertGeoJSON = layer.toGeoJSON();
  var q = 'INSERT INTO ebcplanning (the_geom) VALUES (ST_SetSRID(ST_AsText(ST_GeomFromGeoJSON(\'' + JSON.stringify(insertGeoJSON.geometry) + '\')),4326)) RETURNING cartodb_id';
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
				layer.feature.properties.updated_at = new Date(layer.feature.properties.updated_at);
				var popupText = createEditablePopup(layer);
				layer.bindPopup(popupText);
				layer.on('popupopen', function(){currentLayer = layer;});
				styleMarkers(layer);
				drawnItems.addLayer(layer);
			}
    });
  });
}

function deleteLayers(layer) { // needs to be edited
  drawnItems.removeLayer(layer);
  var q = "DELETE FROM ebcplanning WHERE cartodb_id = " + layer.feature.properties.cartodb_id;
  $.post("./php/callInsertProxy.php", {
    qurl:q,
    cache: false,
    timeStamp: new Date().getTime()
  });
}

function editLayers(layer) { // needs to be edited
  var editGeoJSON = layer.toGeoJSON();
  var q = 'UPDATE ebcplanning SET the_geom = (ST_SetSRID(ST_AsText(ST_GeomFromGeoJSON(\'' + JSON.stringify(editGeoJSON.geometry) + '\')),4326)) WHERE cartodb_id = ' + layer.feature.properties.cartodb_id;
  $.post("./php/callInsertProxy.php", {
    qurl:q,
    cache: false,
    timeStamp: new Date().getTime()
  });
}

function changeValue(value, id) {
	console.log(id);
  currentLayer.feature.properties[id] = value;
  var q = "UPDATE ebcplanning SET " + id + " = '" + value + "' WHERE cartodb_id = " + currentLayer.feature.properties.cartodb_id;
  $.post("./php/callInsertProxy.php", {
    qurl:q,
    cache: false,
    timeStamp: new Date().getTime()
  });
	var popupText = createEditablePopup(currentLayer);
	currentLayer.bindPopup(popupText);
	if (id == 'policost')
		styleMarkers(currentLayer);
}

/*
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
    fadeOldLines(currentLayer);
	else if (currentLayer.feature.geometry.type == "Point")
    fadeOldPoints(currentLayer);
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
    fadeOldLines(currentLayer);
	else if (currentLayer.feature.geometry.type == "Point")
    fadeOldPoints(currentLayer);
  var popupText = createPopup(currentLayer);
  currentLayer.bindPopup(popupText);
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

*/