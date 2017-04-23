import twitter
#from geojson import Feature, Point, FeatureCollection
#import geojson
import os
import numpy as np
import geopandas as gpd
import time

CONSUMER_KEY = '1rOtJNRrQ2UVLU2qmQUg'
CONSUMER_SECRET = 'CSaZDwHeeMc2ZnVvvuEDf60IUkmlzwJRi2jqq3II0w'
OAUTH_TOKEN = '15410243-GVm4aeHbw2UIXRRBSKhqOwklFUNUOheXBBJmFuA6z'
OAUTH_TOKEN_SECRET = 'sIzbJaCdKbwLakuo6potfqCifXrcLCxYoTDlrJmM'
auth = twitter.oauth.OAuth(OAUTH_TOKEN, OAUTH_TOKEN_SECRET, CONSUMER_KEY, CONSUMER_SECRET)
t = twitter.Twitter(auth=auth)

path = '/Users/Darcy/Documents/github/winterbiking/begbutton/Python/'
query = '#yegbegbutton'
sinceID = None
maxID = None
numReturnedTweets = 1
fields = ['user.name', 'user.id', 'user.location', 'user.screen_name', 'text', 'created_at', 'retweet_count', 'favorite_count']

## load previous data
try:
  tweetTable
except(NameError):
  try:
    tweetTable = pd.read_pickle(os.path.join(path, 'BegButtonTweets'))
    print("Read in {} tweets".format(len(tweetTable)))
#    sinceID = tweetTable.index.max()
    maxID = tweetTable.index.min()
  except:
    print("Couldn't read tweetTable")

## start searching
count = 1
while numReturnedTweets:
  locatedStatuses = []
  try:
    trafficTweets = t.search.tweets(q=query, count=100, result_type='recent', since_id=sinceID, max_id=maxID)
  except Exception as e: # need to check if rate limit exceeded
    try:
      print(e.response_data['errors'][0]['message'])
      resetTime = t.application.rate_limit_status()['resources']['search']['/search/tweets']['reset']
      print("Wait until {} before trying again".format(time.strftime('%H:%M:%S', time.localtime(resetTime))))
      time.sleep(resetTime - int(time.time()) + 5) # add 5 seconds just in case
      continue # repeat this loop of the search with the same maxID
    except:
      print(e)
      continue
  numReturnedTweets = len(trafficTweets['statuses']) # I think we're done if no tweets returned
  if numReturnedTweets:
    maxID = np.min([i['id'] for i in trafficTweets['statuses']]) - 1
    if numReturnedTweets % 100 != 0:
      print("Number of tweets is {} on pass {}".format(numReturnedTweets, count))
    locatedStatuses.extend([i for i in trafficTweets['statuses'] if i['coordinates']])
    count += 1

    if len(locatedStatuses):
      tempTable = pd.io.json.json_normalize(locatedStatuses)
      tempTable.set_index('id', inplace=True)
      try:
        tweetTable = tweetTable.append(tempTable[['coordinates.coordinates'] + fields])
      except:
        tweetTable = tempTable[['coordinates.coordinates'] + fields]

    if 'tweetTable' in locals():
      tweetTable.to_pickle(os.path.join(path, 'BegButtonTweets'))
    #  print("Wrote out {} tweets".format(len(tweetTable)))

  myFeatures = []
  for i, row in tweetTable.iterrows():
    myFeatures.append(Feature(geometry=Point(row['coordinates.coordinates']), properties=row[fields].to_dict()))
  with open(os.path.join(path, 'WomensMarchTweets.geojson'), 'w') as f:
    geojson.dump(FeatureCollection(myFeatures), f)
else:
  print("No geotagged tweets yet")
