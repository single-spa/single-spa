#!/bin/bash

###
# This script updates the local repo with the latest changes from Github.
#
# The master branch will be REPLACED with what's in Github and all local changes
# will be LOST.
###

git checkout master
git fetch -f origin
git fetch --tags origin
git reset --hard origin/master
