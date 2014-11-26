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
//  console.log(tempLayer);
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
      layer.setOpacity(0.1);
    else if (daysDiff <= 14)
      layer.setOpacity(0.5);
    else if (daysDiff <= 21)
      layer.setOpacity(0.25);
    else
      layer.setOpacity(0.1);
  }
}