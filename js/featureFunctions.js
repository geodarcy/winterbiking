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
  styleMarkers(feature, layer);
  if (feature.geometry.type == "LineString")
    fadeOldMarkers(feature, layer);
}

function styleMarkers (feature, layer) {
//  console.log(feature);
  if (feature.geometry.type == "LineString" & feature.properties.Condition == "Poor")
    layer.setStyle({color: "#ff0000"});
  if (feature.geometry.type == "LineString" & feature.properties.Condition == "Fair")
    layer.setStyle({color: "#f7f619"});
  if (feature.geometry.type == "LineString" & feature.properties.Condition == "Good")
    layer.setStyle({color: "green", opacity: 1});
  if (feature.geometry.type == "Point" & feature.properties.Condition == "Hazard")
    layer.setIcon(hazardIcon);
  if (feature.geometry.type == "Point" & feature.properties.Condition == "Caution")
    layer.setIcon(cautionIcon);
}

function fadeOldMarkers (feature, layer) {
  var editedDate = new Date(feature.properties.last_edited_date);
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