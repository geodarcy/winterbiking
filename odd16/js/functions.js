function colourData(feature) {
	var zValue = 0;
	var count = 0
	for (i=0; i<document.getElementsByName('checkCensus').length; i++)
	{
		if (document.getElementsByName('checkCensus')[i].checked)
		{
			zValue += feature.properties[document.getElementsByName('checkCensus')[i].value];
			count++;
		}
	}
	if (count)
		zValuve = zValue/count;
	
  return {
    fillColor: getDataColour(zValuve),
    weight: 2,
    opacity: 0.8,
    color: '#C8C8C8',
    fillOpacity: 0.5
  };
}

function getDataColour(d)
{
  return d > 2 ? '#d7191c' :
         d > 1 ? '#fdae61' :
         d > -1 ? '#ffffbf' :
         d > -2 ? '#a6d96a' :
         '#1a9641';
}

function filterData() {
	neighbourhoods.eachLayer(function (layer) {
		layer.setStyle(colourData);
//	neighbourhoods.setStyle(colourData);
	});
}