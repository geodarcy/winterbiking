import pandas as pd
from pandas import DataFrame
import os

path = '/Users/Darcy/Documents/github/winterbiking/pfp2/data'
dataset = 'suggestedroutes.csv'
routes = pd.read_csv(os.path.join(path,dataset))

suggestions = list(routes.addedcomment.dropna())
suggestions = "".join(suggestions).split('NewComment\n')

while '' in suggestions:
  suggestions.pop(suggestions.index(''))

with open(os.path.join(path, "suggestions.txt"), 'w') as f:
  f.writelines("\n".join(suggestions))

comments = list(routes.comments.dropna())

with open(os.path.join(path, "comments.txt"), 'w') as f:
  f.writelines("\n".join(comments))
