var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>';
var stamenTonerLiteUrl = 'http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png'
var stamenTonerLiteAttrib = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
var cartoDBUrl='http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
var cartoDBAttrib='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
var imageryUrl='http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
var imageryAttrib='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});
var stamenTonerLite = new L.TileLayer(stamenTonerLiteUrl, {attribution: stamenTonerLiteAttrib});
var cartoDB = new L.TileLayer(cartoDBUrl, {attribution: cartoDBAttrib});
var imagery = new L.TileLayer(imageryUrl, {attribution: imageryAttrib});
var openPrecipitation = L.tileLayer('http://{s}.tile.openweathermap.org/map/precipitation_cls/{z}/{x}/{y}.png?appid={1120f384e259d527e8a4449f3b942382}', {
attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
opacity: 0.5
});
var openTemperature = L.tileLayer('http://{s}.tile.openweathermap.org/map/temp/{z}/{x}/{y}.png?appid={1120f384e259d527e8a4449f3b942382}', {
attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
opacity: 0.5
});

var baseMaps = {
	"Satellite": imagery,
	"CartoDB": cartoDB,
	"Open Street Map": osm,
	"Stamen.TonerLite": stamenTonerLite
};
var overlays = {
	"Temperature": openTemperature,
	"Precipitation": openPrecipitation
};
