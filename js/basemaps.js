var osmUrl='http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
var osmAttrib='&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>';
var topoUrl='http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
var topoAttrib='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
var imageryUrl='http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
var imageryAttrib='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});
var topo = new L.TileLayer(topoUrl, {attribution: topoAttrib});
var imagery = new L.TileLayer(imageryUrl, {attribution: imageryAttrib});
var openPrecipitation = L.tileLayer('http://{s}.tile.openweathermap.org/map/precipitation_cls/{z}/{x}/{y}.png', {
attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
opacity: 0.5
});
var openTemperature = L.tileLayer('http://{s}.tile.openweathermap.org/map/temp/{z}/{x}/{y}.png', {
attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
opacity: 0.5
});

var baseMaps = {
	"Satellite": imagery,
	"Topographic": topo,
	"Open Street Map": osm
};
var overlays = {
	"Temperature": openTemperature,
	"Precipitation": openPrecipitation
};
