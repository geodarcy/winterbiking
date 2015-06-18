function loadAllData()
{
  var bikeIcon = L.divIcon({
    html: '<div><i class="fa fa-bicycle fa-lg"></i></div>',
    className: 'bike-div-icon'
  });

  var pedIcon = L.divIcon({
    html: '<div><i class="fa fa-user fa-lg"></i></div>',
    className: 'ped-div-icon'
  });

  var url = './geojson/CollisionData.geojson';
  $.getJSON(url, function(data) {
    var myJson = L.geoJson(data, {
      onEachFeature: function (feature, layer) {
        var popupText = feature.properties['Collision Location Name'];
        popupText += "<br/><strong>Roadway Portion:</strong> " + feature.properties['Roadway Portion'];
        popupText += "<br/><strong>Year:</strong> " + feature.properties['Year'];
        popupText += "<br/><strong>Mode:</strong> " + feature.properties['Mode'];
        popupText += "<br/><strong>Count:</strong> " + feature.properties['Count'];
        layer.bindPopup(popupText);
        if(feature.properties['Mode'] == 'Bike')
          layer.setIcon(bikeIcon);
        else
          layer.setIcon(pedIcon);
        markers.addLayer(layer);
      }
    });
  });
}