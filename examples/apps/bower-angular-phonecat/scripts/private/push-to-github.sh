#!/bin/bash

REMOTE=${1-origin}

scripts/private/retag.sh
git push --force $REMOTE
git push --tags --force $REMOTE
