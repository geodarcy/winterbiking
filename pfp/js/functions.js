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
//  var popupText = "<table><tr><td>Type Of Infrastructure:</td><td><strong>" + layer.feature.properties.type + "</strong></td></tr>";
var popupText = layer.feature.properties.type + "</br>";
//  popupText += "<tr><td>Quality Of Infrastructure:</td><td><strong>" + layer.feature.properties.quality + "</strong></td></tr>";
  popupText += layer.feature.properties.quality + "</br>";
//  popupText += "<tr><td>Political Cost:</td><td><strong>" + layer.feature.properties.policost + "</strong></td></tr>";
  popupText += layer.feature.properties.policost + "</br>";
  if (layer.feature.properties.comments)
//    popupText += "<tr><td>Comments:</td><td><strong>" + layer.feature.properties.comments + "</strong></td></tr>";
    popupText += "</br><strong>Comment:</strong></br>" + layer.feature.properties.comments + "</br></br>";
	if (localStorage.getItem("ID" + layer.feature.properties.cartodb_id) != 1) {
//		popupText += "<tr><td><button value='like' onclick='addVote(value)'>I like it</button></td>";
//		popupText += "<td><button value='hate' onclick='addVote(value)'>I don't like it</button></td></tr>";
		popupText += "<button value='like' onclick='addVote(value)'>I like it</button>";
		popupText += "<button value='hate' onclick='addVote(value)'>I don't like it</button></br>";
	}
	else {
//		popupText += "<tr><td><button disabled>I liked it</button></td>";
//		popupText += "<td><button disabled>I didn't like it</button></td></tr>";
		popupText += "<button disabled>I liked it</button>";
		popupText += "<button disabled>I didn't like it</button></br>";
	}
//	popupText += "<tr><td><button onclick='addComment()'>Add comment</button></td></tr>";
//	popupText += "</table>";
	popupText += "<button onclick='addComment()'>Add comment</button>";
	return popupText;
}

function createEditablePopup(layer) { // needs to be edited
  var popupText = "Type Of Infrastructure: <select id='type' onchange='changeValue(this.value, this.id)'>";
  if (!layer.feature.properties.type)
    popupText += "<option disabled selected='selected'>Select Type Of Infrastructure</option><option";
  else
    popupText += "<option";
  if (layer.feature.properties.type == 'Short Connection')
    popupText += " selected='selected' ";
  popupText += ">Short Connection</option><option";
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
  if (layer.feature.properties.comments)
    popupText += "Comments:</br><textarea id='comments' onchange='changeValue(this.value, this.id)' tabindex='2'>" + layer.feature.properties.comments + "</textarea><br>";
	else
		popupText += "Comments:</br><textarea id='comments' onchange='changeValue(this.value, this.id)' tabindex='2' placeholder='Add your comment...' rows='20'></textarea><br>";
	popupText += "<input type=BUTTON value='Submit' name='mySubmit' onClick='closeThisPopup()'>";
	return popupText;
}

function styleMarkers (layer) {
  layer.setStyle({opacity: 0.9});
  if (layer.feature) {
    if (layer.feature.properties.quality == "Separated cycle track")
      layer.setStyle({color: "#8BE04A"});
    else if (layer.feature.properties.quality == "Multi-use path")
      layer.setStyle({color: "#ff7f00"});
    else if (layer.feature.properties.quality == "Traffic-calmed bike boulevard")
      layer.setStyle({color: "#e41a1c"});
    else if (layer.feature.properties.quality == "Other")
      layer.setStyle({color: "#064090"});
		else
			layer.setStyle({color: "#984ea3"});
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
				layer.openPopup();
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
	if (id == 'quality')
		styleMarkers(currentLayer);
}

function loadBikePaths() {
  var url = './data/bikepaths.geojson';
  try {
		$.getJSON(url, function(data) {
			var readLayer = L.geoJson(data, {
				onEachFeature: function (feature, layer) {
//					var popupText = "Current infrastructure<br>Type: <strong>" + feature.properties.type + "</strong>";
					var popupText = "Current infrastructure<br><strong>" + feature.properties.type + "</strong>";
					layer.bindPopup(popupText);
					layer.setStyle({weight: 3,
													dashArray: "5,5",
													opacity: 0.9
					});
				  if (layer.feature) {
				    if (layer.feature.properties.type == "Contra-Flow")
				      layer.setStyle({color: "#beaed4"});
				    else if (layer.feature.properties.type == "Marked On-Street")
				      layer.setStyle({color: "#377eb8"});
				    else if (layer.feature.properties.type == "Shared Use Pathway")
				      layer.setStyle({color: "#F4DA25"});
				    else if (layer.feature.properties.type == "Signed Route")
				      layer.setStyle({color: "#064090"});
						else if (layer.feature.properties.type == "Shared Lane")
							layer.setStyle({color: "#984ea3"});
						else
							layer.setStyle({color: "#aaaaaa"});
				  }
				  existingBikeJson.addLayer(layer);
				}
			});
		});
	}
	catch(err) {
		console.log("There are no data yet.");
	}
}

function closeThisPopup() {
	currentLayer.closePopup();
}

function addVote(value) {
	if (value == 'like') {
		var likes = currentLayer.feature.properties.likecount;
		likes++;
	  var q = "UPDATE ebcplanning SET likecount = '" + likes + "' WHERE cartodb_id = " + currentLayer.feature.properties.cartodb_id;
	  $.post("./php/callInsertProxy.php", {
	    qurl:q,
	    cache: false,
	    timeStamp: new Date().getTime()
	  });
	}
	else if (value == 'hate') {
		var hates = currentLayer.feature.properties.hatecount;
		hates++;
	  var q = "UPDATE ebcplanning SET hatecount = '" + hates + "' WHERE cartodb_id = " + currentLayer.feature.properties.cartodb_id;
	  $.post("./php/callInsertProxy.php", {
	    qurl:q,
	    cache: false,
	    timeStamp: new Date().getTime()
	  });		
	}
	localStorage.setItem("ID" + currentLayer.feature.properties.cartodb_id, 1);
	var popupText = createPopup(currentLayer);
	currentLayer.bindPopup(popupText);
}

function addComment() {
	var addedComment = prompt("Submit your comment to our database");
	if (addedComment != null) {
		var added = currentLayer.feature.properties.addedcomment;
		if (added)
		  added += "\nNewComment\n" + addedComment;
		else
			added = "NewComment\n" + addedComment;
		currentLayer.feature.properties.addedcomment = added;
	  var q = "UPDATE ebcplanning SET addedcomment = '" + added + "' WHERE cartodb_id = " + currentLayer.feature.properties.cartodb_id;
	  $.post("./php/callInsertProxy.php", {
	    qurl:q,
	    cache: false,
	    timeStamp: new Date().getTime()
	  });
	}
}