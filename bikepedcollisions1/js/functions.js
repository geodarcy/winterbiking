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
        var modeYear = feature.properties['Mode'] + feature.properties['Year'];
        var popupText = feature.properties['Collision Location Name'];
        popupText += "<br/><strong>Roadway Portion:</strong> " + feature.properties['Roadway Portion'];
        popupText += "<br/><strong>Year:</strong> " + feature.properties['Year'];
        popupText += "<br/><strong>Mode:</strong> " + feature.properties['Mode'];
        popupText += "<br/><strong>Count:</strong> " + feature.properties['Count'];
        layer.bindPopup(popupText);
        if(feature.properties['Mode'] == 'Bike')
        {
          layer.setIcon(bikeIcon);
        }
        else
        {
          layer.setIcon(pedIcon);
        }
        if (! layerDict[modeYear])
          layerDict[modeYear] = [layer];
        else
        layerDict[modeYear].push(layer);
        markers.addLayer(layer);
      }
    });
  });
}

function filterData()
{
  if (document.getElementById('modeMenu').value == 'all')
    var modes = ['Bike', 'Ped'];
  else
    var modes = [document.getElementById('modeMenu').value];
  var years = [];
  for (i=0; i<document.getElementsByName('checkYear').length; i++)
  {
    if (document.getElementsByName('checkYear')[i].checked)
      years.push(document.getElementsByName('checkYear')[i].value);
  }
  markers.clearLayers();
  for (i=0; i<modes.length; i++)
  {
    for (j=0; j<years.length; j++)
    {
      markers.addLayers(layerDict[modes[i] + years[j]]);
    }
  }
}

function getStatsCanColour(d)
{
  return d > 0.2 ? '#810f7c' :
         d > 0.15 ? '#8856a7' :
         d > 0.1 ? '#8c96c6' :
         d > 0.05 ? '#b3cde3' :
         d > 0 ? '#edf8fb' :
         '#C8C8C8';
}

function colourStatsCan(feature) {
  return {
    fillColor: getStatsCanColour(feature.properties.BikePedPct),
    weight: 2,
    opacity: 0.8,
    color: '#C8C8C8',
    fillOpacity: 0.5
  };
}

function loadStatsCan()
{
  var url = './geojson/EdmontonCensusTracts.geojson';
  $.getJSON(url, function(data) {
    var json = L.geoJson(data, {
      onEachFeature: function (feature, layer) {
        layer.bindPopup("Per cent of people who bike or walk to work: " + String(Math.round(feature.properties['BikePedPct']*1000)/10) + "%");
      },
      style: colourStatsCan
    });
    statsCan.addLayer(json);
  });
}