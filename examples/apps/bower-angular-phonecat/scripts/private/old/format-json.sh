#!/bin/bash

#####
# Helper script for pretty formatting of json files
#####

for file in `ls -a app/phones | grep -v \\\.\$`; do
  cat app/phones/$file | python -mjson.tool > tmp.json
  rm app/phones/$file
  mv tmp.json app/phones/$file
done
