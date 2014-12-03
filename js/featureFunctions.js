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
		var url = "https://geodarcy.cartodb.com/api/v2/sql?format=geojson&q=SELECT cartodb_id,the_geom,condition,created_user,last_edited_date,comment FROM winterbiking";
    $.getJSON(url, function(data) {
      geojsonLayer = L.geoJson(data, {
        onEachFeature: function (feature, layer) {
          layer.cartodb_id=feature.properties.cartodb_id;
          feature.properties.last_edited_date = new Date(feature.properties.last_edited_date);
          drawnItems.addLayer(layer);
        }
      });
      map.addLayer(drawnItems);
      updateAllMarkers();
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

function changecondition(value) {
  currentLayer.feature.properties.condition = value;
  currentLayer.feature.properties.last_edited_date = new Date();
  updateAllMarkers();
}

function changecomment(value) {
  currentLayer.feature.properties.comment = value;
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
    if (layer.feature.geometry.type == "MultiLineString")
      fadeOldLines(layer);
		if (layer.feature.geometry.type == "Point")
			fadeOldPoints(layer);
    var popupText = createPopup(layer);
    layer.bindPopup(popupText);
  });
/*  jsonData = JSON.stringify(drawnItems.toGeoJSON());
//  console.log(jsonData);
  writeData(function() {
		$.post("./php/writewbjson.php", 'data='+jsonData, function(){drawnItems.clearLayers();readData();});
	});*/
}

function createPopup(layer) {
  var myLayer = layer;
  var popupText = "Condition: <select id='condition' onchange='changecondition(this.value)'>";
  if (!layer.feature.properties.condition)
    popupText += "<option disabled selected='selected'>Select a riding condition</option><option";
  else
    popupText += "<option";
  if (layer.feature.geometry.type == "MultiLineString") {
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
  popupText += "Comment: <textarea onchange='changecomment(this.value)' tabindex='1'>" + layer.feature.properties.comment + "</textarea><br>";
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
  if (tempLayer.feature.geometry.type == "MultiLineString")
    fadeOldLines(tempLayer);
  if (tempLayer.feature.geometry.type == "Point")
    fadeOldPoints(tempLayer);
  drawnItems.addLayer(tempLayer);
}

function styleMarkers (layer) {
//  console.log(layer);
  if (layer.feature) {
    if (layer.feature.geometry.type == "MultiLineString" & layer.feature.properties.condition == "Poor")
      layer.setStyle({color: "#ff0000"});
    if (layer.feature.geometry.type == "MultiLineString" & layer.feature.properties.condition == "Fair")
      layer.setStyle({color: "#f7f619"});
    if (layer.feature.geometry.type == "MultiLineString" & layer.feature.properties.condition == "Good")
      layer.setStyle({color: "green"});
    if (layer.feature.geometry.type == "Point" & layer.feature.properties.condition == "Hazard")
      layer.setIcon(hazardIcon);
    if (layer.feature.geometry.type == "Point" & layer.feature.properties.condition == "Caution")
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

function persistOnCartoDB(action,layers) {
  console.log(action);
  console.log(layers);
  var cartodb_ids=[];
  var geojsons=[];

  switch(action) {
    case "UPDATE":
      if (layers.getLayers().length<1) return;

      layers.eachLayer(function(layer) {
        cartodb_ids.push(layer.cartodb_id);
        geojsons.push("'"+JSON.stringify(layer.toGeoJSON())+"'");
      });
      break;

    case "INSERT":
      cartodb_ids.push(-1);
      geojsons.push("'"+JSON.stringify(layers.toGeoJSON())+"'");
      break;

    case "DELETE":
      layers.eachLayer(function(layer) {
        cartodb_ids.push(layer.cartodb_id);
        geojsons.push("''");
      });
      break;
  }

  var sql = "SELECT geodarcy_upsert_leaflet_data(ARRAY[";
  sql += cartodb_ids.join(",");
  sql += "],ARRAY[";
  sql += geojsons.join(",");
  sql += "]);";

  console.log("persisting... " + sql  );
  $.ajax({
    type: 'POST',
    url: 'https://geodarcy.cartodb.com/api/v2/sql',
    crossDomain: true,
    data: {"q":sql},
    dataType: 'json',
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Bearer $token")
    },
    success: function(responseData, textStatus, jqXHR) {
      console.log("Data saved");

      if (action=="INSERT")
        layers.cartodb_id = responseData.rows[0].cartodb_id;
    },
    error: function (responseData, textStatus, errorThrown) {
      console.log("Problem saving the data");
    }
  });
}