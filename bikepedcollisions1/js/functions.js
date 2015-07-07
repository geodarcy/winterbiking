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

  var url = 'https://geodarcy.cartodb.com/api/v2/sql?format=geojson&q=SELECT * FROM extendedcollisiondata';
  $.getJSON(url, function(data) {
    var myJson = L.geoJson(data, {
      onEachFeature: function (feature, layer) {
        var modeYear = feature.properties['mode'] + feature.properties['year'];
        var location = feature.properties['collision_location_name'].replace('&', '%26');
        var portion = feature.properties['roadway_portion'];
        var popupText = feature.properties['collision_location_name'];
        popupText += "<br/><strong>Roadway Portion:</strong> " + feature.properties['roadway_portion'];
        popupText += "<br/><strong>Year:</strong> " + feature.properties['year'];
        popupText += "<br/><strong>Mode:</strong> " + feature.properties['mode'];
        popupText += "<br/><br/>Is this point <a href='&#x6d;&#97;&#x69;&#x6c;&#x74;&#111;&#58;&#x64;&#97;&#114;&#x63;&#121;&#x40;&#x77;&#x69;&#x6e;&#x74;&#x65;&#114;&#x62;&#x69;&#107;&#x69;&#110;&#x67;&#46;&#99;&#x61;?Subject=Vulnerable%20User%20Collision%20Map%20location%20error&body=" + location + "%0D" + portion + "'>misplaced</a>?"

//        popupText += "<br/><strong>Count:</strong> " + feature.properties['Count'];
        layer.bindPopup(popupText);
        if(feature.properties['mode'] == 'Bike')
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
    getIncidentCount();
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
  getIncidentCount();
}

function toggleChecks()
{
  if (document.getElementById('checkToggle').checked)
  {
    for (i=0; i<document.getElementsByName('checkYear').length; i++)
      document.getElementsByName('checkYear')[i].checked = true;
  }
  else
  {
    for (i=0; i<document.getElementsByName('checkYear').length; i++)
      document.getElementsByName('checkYear')[i].checked = false;
  }
  filterData();
}

function getStatsCanColour(d)
{
  return d > 0.2 ? '#810f7c' :
         d > 0.15 ? '#8856a7' :
         d > 0.1 ? '#8c96c6' :
         d > 0.05 ? '#b3cde3' :
         d >= 0 ? '#edf8fb' :
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
  var url = './geojson/StatsCanCensusTracts.geojson';
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

function loadEdmCensus()
{
  var url = './geojson/EdmontonCensus.geojson';
  $.getJSON(url, function(data) {
    var json = L.geoJson(data, {
      onEachFeature: function (feature, layer) {
        layer.bindPopup("Per cent of people who bike or walk to work: " + String(Math.round(feature.properties['BikePedPct']*1000)/10) + "%");
      },
      style: colourStatsCan
    });
    edmCensus.addLayer(json);
  });
}

function getIncidentCount()
{
  var mapBounds = map.getBounds();
  var count = 0;
  markers.eachLayer(function(marker) {
    if(mapBounds.contains(marker.getLatLng()))
      count++;
  });
  document.getElementById('incidentCount').innerHTML = "<strong>Number of incidents in the current map view:</strong> " + count.toString();
}