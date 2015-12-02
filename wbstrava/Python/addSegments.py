## import libraries
from stravalib.client import Client
from polyline.codec import PolylineCodec
from cartodb import CartoDBAPIKey, CartoDBException
from geojson import Feature, LineString

## Strava connection
client = Client()
client.access_token = 'd47099a29b2f3539e1c21af6d820e33a109a079e'

## CartoDB connection
API_KEY ='cad54ea0c580a0c554b9e9562157e7c9bd9f37b0'
cartodb_domain = 'geodarcy'
cl = CartoDBAPIKey(API_KEY, cartodb_domain)

## get list of segments already in CartoDB
queryResult = cl.sql('select segment_id from wbstrava')
currentSegments = [x['segment_id'] for x in queryResult['rows']]

## get started segments from a user
segmentIDs = [x.id for x in client.get_starred_segment()]

for id in segmentIDs:
  if id not in currentSegments:
		segmentGeojson = PolylineCodec().decode(client.get_segment(id).map.polyline)
		flippedGeojson = [[x[1], x[0]] for x in segmentGeojson]
		inputGeojson = '{"coordinates": ' + str(flippedGeojson) + ', "type": "LineString", "crs":{"type":"name","properties":{"name":"EPSG:4326"}}}'
		cl.sql('INSERT INTO wbstrava (the_geom, segment_id) VALUES (ST_GeomFromGeoJSON(\'' + inputGeojson + '\'), ' + str(id) + ')')