## import libraries
from stravalib.client import Client
from cartodb import CartoDBAPIKey, CartoDBException
import numpy as np
import datetime
import time
from polyline.codec import PolylineCodec
from geojson import Feature, LineString

## Strava connection
client = Client()
client.access_token = 'd47099a29b2f3539e1c21af6d820e33a109a079e'

## CartoDB connection
API_KEY ='cad54ea0c580a0c554b9e9562157e7c9bd9f37b0'
cartodb_domain = 'geodarcy'
cl = CartoDBAPIKey(API_KEY, cartodb_domain)

## remove duplicate rows
cl.sql('DELETE FROM wbstrava WHERE cartodb_id IN (SELECT cartodb_id FROM (SELECT cartodb_id, ROW_NUMBER() OVER (partition BY segment_id ORDER BY cartodb_id) AS rnum FROM wbstrava) t WHERE t.rnum > 1);')

## find segments with no geometry
queryResult = cl.sql('select segment_id from wbstrava where the_geom is null')
currentSegments = [x['segment_id'] for x in queryResult['rows']]
for id in currentSegments:
  try:
    segmentGeojson = PolylineCodec().decode(client.get_segment(id).map.polyline)
  except Exception as e:
    if "Not Found" in e.message:
      cl.sql('DELETE FROM wbstrava WHERE segment_id= ' + str(id))
      print("Deleted Strava ID: {}".format(id))
    else:
      print("Something's wrong with Strava ID: {}".format(id))
  flippedGeojson = [[x[1], x[0]] for x in segmentGeojson]
  inputGeojson = '{"coordinates": ' + str(flippedGeojson) + ', "type": "LineString", "crs":{"type":"name","properties":{"name":"EPSG:4326"}}}'
  cl.sql('UPDATE wbstrava SET the_geom = ST_GeomFromGeoJSON(\'' + inputGeojson + '\') WHERE segment_id=' + str(id))

## get list of segments already in CartoDB
queryResult = cl.sql('select segment_id from wbstrava')
currentSegments = [x['segment_id'] for x in queryResult['rows']]

now = datetime.datetime.now()
weekAgo = now + datetime.timedelta(days=-7)
for segment in currentSegments:
  weekEfforts = client.get_segment_efforts(segment, start_date_local=weekAgo, end_date_local=now)
  weekEffortsTimes = [i.moving_time.seconds for i in weekEfforts]
  try:
    leaderboard = client.get_segment_leaderboard(segment, top_results_limit=100)
    leaderboardTimes = [x.moving_time.seconds for x in leaderboard if x.rank <= 100]
#    print('Updated {} with {} efforts and {} leaderboard entries'.format(segment, len(weekEffortsTimes), leaderboard.effort_count))
  except:
#    cl.sql('DELETE FROM wbstrava WHERE segment_id=' + str(segment))
#    print('Deleted: {}'.format(client.get_segment(segment).name))
    print('Couldn\'t update: {}'.format(client.get_segment(segment).name))
  if len(weekEffortsTimes) and len(leaderboardTimes):
    segmentMean = np.divide(np.mean(leaderboardTimes), np.mean(weekEffortsTimes)).astype('str')
  else:
    segmentMean = '0'
  cl.sql('UPDATE wbstrava SET ratio = ' + segmentMean + ' WHERE segment_id=' + str(segment))
  cl.sql('UPDATE wbstrava SET count = ' + str(len(weekEffortsTimes)) + ' WHERE segment_id=' + str(segment))
  time.sleep(0.25)
