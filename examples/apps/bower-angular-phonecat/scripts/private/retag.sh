#!/bin/bash

######
# This script is useful only for committers to the upstream github repo.
######

for tag in `git tag`; do
  git tag -d $tag
done

for sha in `git log --oneline | grep step- | cut -d ' ' -f 1`; do
  tag=`git log $sha...$sha~1 --oneline | cut -d ' ' -f 2`
  echo Creating tag $tag for $sha
  git tag $tag $sha
done
