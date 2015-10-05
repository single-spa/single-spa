#!/bin/bash

base_dir=`dirname $0`

rm -rf $base_dir/app/js \
       $base_dir/app/partials \
       $base_dir/app/css \
       $base_dir/test/unit \
       $base_dir/test/e2e

cp -r $base_dir/../step-$1/* $base_dir/

echo "jumped to step $1"
