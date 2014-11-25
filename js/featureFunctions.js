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

function initBikeJson (feature, layer) {
  var tempLayer = layer;
  tempLayer.feature = layer.feature;
  var popupText = "Condition: <b>" + layer.feature.properties.Condition + "</b><br>";
  if (layer.feature.properties.Comment)
    popupText += "Comment: <b>" + layer.feature.properties.Comment + "</b><br>";
  if (layer.feature.properties.created_user)
    popupText += "Created By: <b>" + layer.feature.properties.created_user + "</b><br>";
  popupText += "Created On: <b>" + layer.feature.properties.last_edited_date + "</b>";
  tempLayer.bindPopup(popupText);
  drawnItems.addLayer(tempLayer);
}

function styleMarkers (layer) {
//  console.log(layer);
  if (layer.layer.feature.geometry.type == "LineString" & layer.layer.feature.properties.Condition == "Poor")
    layer.layer.setStyle({color: "#ff0000"});
  if (layer.layer.feature.geometry.type == "LineString" & layer.layer.feature.properties.Condition == "Fair")
    layer.layer.setStyle({color: "#f7f619"});
  if (layer.layer.feature.geometry.type == "LineString" & layer.layer.feature.properties.Condition == "Good")
    layer.layer.setStyle({color: "green"});
  if (layer.layer.feature.geometry.type == "Point" & layer.layer.feature.properties.Condition == "Hazard")
    layer.layer.setIcon(hazardIcon);
  if (layer.layer.feature.geometry.type == "Point" & layer.layer.feature.properties.Condition == "Caution")
    layer.layer.setIcon(cautionIcon);
}

function fadeOldLines (layer) {
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

function fadeOldMarkers (layer) {
  var editedDate = new Date(layer.feature.properties.last_edited_date);
  var today = new Date();
  var timeDiff = Math.abs(editedDate.getTime() - today.getTime());
  var daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
//  console.log(daysDiff);
  if (daysDiff <= 7)
    layer.setOpacity(0.1);
  else if (daysDiff <= 14)
    layer.setOpacity(0.5);
  else if (daysDiff <= 21)
    layer.setOpacity(0.25);
  else
    layer.setOpacity(0.1);
}