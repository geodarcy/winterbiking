var currentLayerID;

function readData() {
  var url = 'https://geodarcy.cartodb.com/api/v2/sql?format=geojson&q=SELECT * FROM rawpaths WHERE NOT (policost is null and quality is null and type is null)';
  try {
		$.getJSON(url, function(data) {
			var readLayer = L.geoJson(data, {
				onEachFeature: function (feature, layer) {
					if (!layer.feature.properties.likecount)
						layer.feature.properties.likecount = 0;
					layer.on('popupopen', function(){
						currentLayerID = layer._leaflet_id;
						var popupText = createPopup(layer);
						layer.bindPopup(popupText);
					});
					layer.on('mouseover', function(){
						layer.setStyle({color: "#984ea3"});
					});
					layer.on('mouseout', function(){
						layer.setStyle({color: layer.feature.properties.colour});
					});
					layer.bindPopup();
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

function createPopup(layer) {
	var popupText = "";
  if (layer.feature.properties.addedcomment)
    popupText += "<strong>Additional Comments:</strong>" + layer.feature.properties.addedcomment.replace(/NewComment/g, "</br></br>") + "</br></br>";
	popupText += "Number of people who like this section: " + layer.feature.properties.likecount + "</br>";
	if (likeCount > 8)
		console.log("How did I get here?");
	else if (localStorage.getItem("ID" + layer.feature.properties.cartodb_id) != 1 && likeCount < 8) {
		popupText += "<button value='like' onclick='addVote(value)'>I like it</button>";
	}
	else if (localStorage.getItem("ID" + layer.feature.properties.cartodb_id) != 1 && likeCount == 8) {
		popupText += "<button disabled>I like it</button>";
	}
	else {
		popupText += "<button value='hate' onclick='addVote(value)'>I changed my mind</button>";
	}
	popupText += "</br><button onclick='addComment()'>Add comment</button>";
	return popupText;
}

function styleMarkers (layer) {
  layer.setStyle({opacity: 0.9, weight: 4});
  if (layer.feature) {
    if (layer.feature.properties.likecount >= maxCount*3/4)
		{
      layer.setStyle({color: "#006d2c"});
			layer.feature.properties.colour = "#006d2c";
		}
    else if (layer.feature.properties.likecount >= maxCount*2/4)
		{
      layer.setStyle({color: "#2ca25f"});
			layer.feature.properties.colour = "#2ca25f";
		}
    else if (layer.feature.properties.likecount >= maxCount/4)
		{
      layer.setStyle({color: "#66c2a4"});
			layer.feature.properties.colour = "#66c2a4";
		}
    else if (layer.feature.properties.likecount > 0)
		{
      layer.setStyle({color: "#b2e2e2"});
			layer.feature.properties.colour = "#b2e2e2";
		}
		else
		{
			layer.setStyle({color: "#CEEDFB"});
			layer.feature.properties.colour = "#CEEDFB";
		}
  }
}

function loadBikePaths() {
  var url = './data/bikepaths.geojson';
  try {
		$.getJSON(url, function(data) {
			var readLayer = L.geoJson(data, {
				onEachFeature: function (feature, layer) {
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
						else if (layer.feature.properties.type == "Future Bike Route")
							layer.setStyle({color: "#a6761d"});
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

function addVote(value) {
	var likes = bikeJson.getLayer(currentLayerID).feature.properties.likecount;
	if (value == 'like') {
		likes = likes + 1;
		localStorage.setItem("ID" + bikeJson.getLayer(currentLayerID).feature.properties.cartodb_id, 1);
	}
	else if (value == 'hate') {
		likes = likes - 1;
		localStorage.setItem("ID" + bikeJson.getLayer(currentLayerID).feature.properties.cartodb_id, 0);
	}
	else
		console.log("This route wasn't liked or hated");
	bikeJson.getLayer(currentLayerID).feature.properties.likecount = likes;
  var q = "UPDATE rawpaths SET likecount = '" + likes + "' WHERE cartodb_id = " + bikeJson.getLayer(currentLayerID).feature.properties.cartodb_id;
  $.post("./php/callInsertProxy.php", {
    qurl:q,
    cache: false,
    timeStamp: new Date().getTime()
  });
	
	if (!likeCount)
	{
		likeCount = 0;
	}
	if (value == 'like')
	  likeCount++;
	else if (value == 'hate')
	  likeCount = likeCount - 1;
	localStorage.setItem("likeCount", likeCount);

	var popupText = createPopup(bikeJson.getLayer(currentLayerID));
	bikeJson.getLayer(currentLayerID).bindPopup(popupText);
	addLegend();
}

function addLegend() {
	var likeString = 8 - likeCount;
  labels = ['Remaining suggestings: <strong>' + likeString + '</strong>'];
  labels.push('<strong>Your suggestions</strong>');
  labels.push('<svg width="18" height="12"> <line x1="0" y1="7" x2="18" y2="7" style="stroke:#006d2c;stroke-width:3"/></svg> Most liked');
  labels.push('<svg width="18" height="12"> <line x1="0" y1="7" x2="18" y2="7" style="stroke:#2ca25f;stroke-width:3"/></svg>');
  labels.push('<svg width="18" height="12"> <line x1="0" y1="7" x2="18" y2="7" style="stroke:#66c2a4;stroke-width:3"/></svg>');
  labels.push('<svg width="18" height="12"> <line x1="0" y1="7" x2="18" y2="7" style="stroke:#b2e2e2;stroke-width:3"/></svg> Least liked');
  labels.push('<svg width="18" height="12"> <line x1="0" y1="7" x2="18" y2="7" style="stroke:#CEEDFB;stroke-width:3"/></svg> Not liked yet');
  labels.push('<hr><strong>Current infrastructure (dashed)</strong>');
  labels.push('<svg width="18" height="12"> <line stroke-dasharray="5, 5" x1="0" y1="7" x2="18" y2="7" style="stroke:#beaed4;stroke-width:3"/></svg> Contra-Flow');
  labels.push('<svg width="18" height="12"> <line stroke-dasharray="5, 5" x1="0" y1="7" x2="18" y2="7" style="stroke:#377eb8;stroke-width:3"/></svg> Marked On-Street');
  labels.push('<svg width="18" height="12"> <line stroke-dasharray="5, 5" x1="0" y1="7" x2="18" y2="7" style="stroke:#F4DA25;stroke-width:3"/></svg> Shared Use Pathway');
	labels.push('<svg width="18" height="12"> <line stroke-dasharray="5, 5" x1="0" y1="7" x2="18" y2="7" style="stroke:#a6761d;stroke-width:3"/></svg> Future Bike Route');
	
	if (legend)
		legend._container.innerHTML = labels.join('<br><br>');
	else
	{
	  legend = L.control({position: 'bottomright'});
	  legend.onAdd = function (map) {
	    var div = L.DomUtil.create('div', 'info legend');
	    div.innerHTML = labels.join('<br><br>');
	    return div;
	  };
	  legend.addTo(map);
	}
}

function getMaxCount() {
	var q = 'https://geodarcy.cartodb.com/api/v2/sql?q=SELECT MAX(likecount) FROM rawpaths';
  $.get(q, function(data) {
    maxCount = data.rows[0]["max"];
     }
	);	
}

function addComment() {
	var addedComment = prompt("Submit your comment to our database");
	if (addedComment != null) {
		var added = bikeJson.getLayer(currentLayerID).feature.properties.addedcomment;
		if (added)
		  added += "\nNewComment\n" + addedComment;
		else
			added = "NewComment\n" + addedComment;
		bikeJson.getLayer(currentLayerID).feature.properties.addedcomment = added;
	  var q = "UPDATE rawpaths SET addedcomment = '" + added + "' WHERE cartodb_id = " + bikeJson.getLayer(currentLayerID).feature.properties.cartodb_id;
	  $.post("./php/callInsertProxy.php", {
	    qurl:q,
	    cache: false,
	    timeStamp: new Date().getTime()
	  });
		var popupText = createPopup(bikeJson.getLayer(currentLayerID));
		bikeJson.getLayer(currentLayerID).bindPopup(popupText);
	}
}