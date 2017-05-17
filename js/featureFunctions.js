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

function changeValue(value, id) {
	console.log(id);
  currentLayer.feature.properties[id] = value;
  var q = "UPDATE winterbiking SET " + id + " = '" + value + "' WHERE cartodb_id = " + currentLayer.feature.properties.cartodb_id;
  $.post("./php/callInsertProxy.php", {
    qurl:q,
    cache: false,
    timeStamp: new Date().getTime()
  });
	var popupText = createPopup(currentLayer);
	currentLayer.bindPopup(popupText);
	if (id == 'condition')
		styleMarkers(currentLayer);
}

function createPopup(layer) {
  var popupText = "Condition: <select id='condition' onchange='changeValue(this.value, this.id)'>";
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
	if (layer.feature.properties.comment)
    popupText += "Comment: <textarea id='comment' onchange='changeValue(this.value, this.id)'>" + layer.feature.properties.comment + "</textarea><br>";
	else
		popupText += "Comment: <textarea id='comment' onchange='changeValue(this.value, this.id)' placeholder='What is it like out there?'></textarea><br>";
	if (layer.feature.properties.creator)
    popupText += "Created By: <textarea id='creator' onchange='changeValue(this.value, this.id)'>" + layer.feature.properties.creator + "</textarea><br>";
	else
		popupText += "Created By: <textarea id='creator' onchange='changeValue(this.value, this.id)' placeholder='Maybe let people know who you are? Your Twitter handle?'></textarea><br>";
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

function getMaxCount() {
	var q = 'https://geodarcy.cartodb.com/api/v2/sql?q=SELECT MAX(count) FROM wbstrava';
  $.getJSON(q, function(data) {
    maxCount = data.rows[0]["max"], addLegend();
     }
	);
}

function addLegend() {
  labels = [];
/*        labels.push('Last week\'s efforts as a percentage of the all-time top 100'); // legend for ratios
  labels.push('<i style="background:#1a9641"></i> > 80%');
  labels.push('<i style="background:#a6d96a"></i> 60% - 80%');
  labels.push('<i style="background:#ffffbf"></i> 40% - 60%');
  labels.push('<i style="background:#fdae61"></i> 20% - 40%');
  labels.push('<i style="background:#d7191c"></i> < 20%');
  labels.push('<i style="background:#777777"></i> No recent data'); */
  labels.push('<strong>Number of recent Strava riders</strong>'); // legend for counts
  labels.push('<svg width="18" height="12"> <line x1="0" y1="7" x2="18" y2="7" style="stroke:#ca0020;stroke-width:3"/></svg> 100 - ' + maxCount); // + Math.ceil(maxCount*3/4) + ' - ' + maxCount);
  labels.push('<svg width="18" height="12"> <line x1="0" y1="7" x2="18" y2="7" style="stroke:#f4a582;stroke-width:3"/></svg> 50 - 99'); // + Math.ceil(maxCount*2/4) + ' - ' + Math.floor(maxCount*3/4));
  labels.push('<svg width="18" height="12"> <line x1="0" y1="7" x2="18" y2="7" style="stroke:#92c5de;stroke-width:3"/></svg> 10 - 49'); // + Math.ceil(maxCount*1/4) + ' - ' + Math.floor(maxCount*2/4));
  labels.push('<svg width="18" height="12"> <line x1="0" y1="7" x2="18" y2="7" style="stroke:#0571b0;stroke-width:3"/></svg> 0 - 9'); // + Math.floor(maxCount*1/4));
  labels.push('<svg width="18" height="12"> <line x1="0" y1="7" x2="18" y2="7" style="stroke:#636363;stroke-width:3"/></svg> Not recently ridden');
  legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = labels.join('<br><br>');
    return div;
  };
  legend.addTo(map);
}

function stravaHelp() {
  alert("The segment ID is the 7 or so digits at the end of a segment's URL. Click on the link in any popup for an example.");
}

function readBBData() {
  var url = 'https://geodarcy.cartodb.com/api/v2/sql?format=geojson&q=SELECT * FROM begbuttonall WHERE the_geom IS NOT null';
  try {
    $.getJSON(url, function(data) {
      var bbJson = L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng);
        },
        onEachFeature: initBBJson
      });
    });
  }
  catch(err) {
    console.log("There are no data yet.");
  }
}

function initBBJson (feature, layer) {
  var tempLayer = layer;
  tempLayer.feature = layer.feature;
  tempLayer.feature.properties.updated_at = new Date(tempLayer.feature.properties.updated_at);
  var popupText = createBBPopup(tempLayer);
  tempLayer.bindPopup(popupText);
  tempLayer.on('popupopen', function(){currentLayer = tempLayer;});
  styleBBMarkers(tempLayer);
  drawnItems.addLayer(tempLayer);
}

function createBBPopup(layer) {
  var popupText = "Average wait time: " + Math.round(layer.feature.properties.waittime) + " seconds";
  popupText += "</br><button id='addtime' onclick='changeBBValue(this.value, this.id)'>Add your wait time</button>";
  return popupText;
}

function changeBBValue(value, id) {
  var waittime = prompt("Please enter your wait time in seconds:");
  var oldTotalWait = currentLayer.feature.properties.totalwait;
  var oldCount = currentLayer.feature.properties.count;
  var totalWait = parseInt(waittime) + oldTotalWait;
  var count = oldCount + 1;
  currentLayer.feature.properties.totalwait = totalWait;
  currentLayer.feature.properties.count = count;
  currentLayer.feature.properties.waittime = totalWait / count;
  console.log(currentLayer.feature.properties.waittime);
  var q = "UPDATE begbuttonall SET totalwait = " + totalWait + ", count = " + count + ", waittime = " + totalWait / count + " WHERE cartodb_id = " + currentLayer.feature.properties.cartodb_id;
  $.post("../php/callInsertProxy.php", {
    qurl:q,
    cache: false,
    timeStamp: new Date().getTime()
  });
  var popupText = createBBPopup(currentLayer);
  currentLayer.bindPopup(popupText);
  currentLayer.closePopup();
  currentLayer.openPopup();
  styleBBMarkers(currentLayer);
}

function insertBBNewLayer(layer) {
  var insertGeoJSON = layer.toGeoJSON();
  var q = 'INSERT INTO begbuttonall (the_geom) VALUES (ST_SetSRID(ST_AsText(ST_GeomFromGeoJSON(\'' + JSON.stringify(insertGeoJSON.geometry) + '\')),4326)) RETURNING cartodb_id';
  $.post("../php/callInsertProxy.php", {
    qurl:q,
    cache: false,
    timeStamp: new Date().getTime()
  }, function(data) {
    var foo = JSON.parse(data);
//    console.log(insertGeoJSON);
    insertGeoJSON.properties.cartodb_id = foo.rows[0]["cartodb_id"];
    insertGeoJSON.properties.updated_at = new Date();
    insertGeoJSON.properties.totalwait = 0;
    insertGeoJSON.properties.count = 0;
    insertGeoJSON.properties.waittime = 0;
    L.geoJson(insertGeoJSON, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng);
      },
      onEachFeature: function (feature, layer) {
				initBBJson(feature,layer);
				layer.openPopup();
			}
    });
  });
}

function deleteBBLayers(layer) {
  drawnItems.removeLayer(layer);
  var q = "DELETE FROM begbuttonall WHERE cartodb_id = " + layer.feature.properties.cartodb_id;
  $.post("../php/callInsertProxy.php", {
    qurl:q,
    cache: false,
    timeStamp: new Date().getTime()
  });
}

function editBBLayers(layer) {
  var editGeoJSON = layer.toGeoJSON();
  var q = 'UPDATE begbuttonall SET the_geom = (ST_SetSRID(ST_AsText(ST_GeomFromGeoJSON(\'' + JSON.stringify(editGeoJSON.geometry) + '\')),4326)) WHERE cartodb_id = ' + layer.feature.properties.cartodb_id;
  $.post("../php/callInsertProxy.php", {
    qurl:q,
    cache: false,
    timeStamp: new Date().getTime()
  });
}

function styleBBMarkers (layer) {
  var waitTime = parseInt(layer.feature.properties.waittime);
  if (waitTime < 10) {
    var styleColor = "#ffffb2";
  } else if (waitTime < 20) {
    var styleColor = "#fed976";
  } else if (waitTime < 30) {
    var styleColor = "#feb24c";
  } else if (waitTime < 40) {
    var styleColor = "#fd8d3c";
  } else if (waitTime < 50) {
    var styleColor = "#fc4e2a";
  } else if (waitTime < 60) {
    var styleColor = "#e31a1c";
  } else {
    var styleColor = "#b10026";
  }
  layer.setStyle({fillColor: styleColor,
                  fillOpacity: 1,
                  weight: 1,
                  color: "#b10026"
  })
}

function getMaxWait() {
	var q = 'https://geodarcy.cartodb.com/api/v2/sql?q=SELECT MAX(waittime) FROM begbuttonall';
  $.getJSON(q, function(data) {
    maxWait = data.rows[0]["max"], addBBLegend();
     }
	);
}

function addBBLegend() {
  labels = [];
  labels.push('Average wait time')
  labels.push('<i id="circle" style="background:#ffffb2"></i> < 10 seconds');
  labels.push('<i id="circle"  style="background:#fed976"></i> 10-20 seconds');
  labels.push('<i id="circle"  style="background:#feb24c"></i> 20-30 seconds');
  labels.push('<i id="circle"  style="background:#fd8d3c"></i> 30-40 seconds');
  labels.push('<i id="circle"  style="background:#fc4e2a"></i> 40-50 seconds');
  labels.push('<i id="circle"  style="background:#e31a1c"></i> 50-60 seconds');
  labels.push('<i id="circle"  style="background:#b10026"></i> 60-' + Math.round(maxWait) + ' seconds');
  legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = labels.join('<br><br>');
    return div;
  };
  legend.addTo(map);
}
