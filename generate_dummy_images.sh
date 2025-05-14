#!/bin/bash

# Ensure output directory exists
mkdir -p output

# Loop to create 16 images
for i in $(seq -w 1 16); do
    # Generate random hex color
    COLOR=$(printf "#%06X\n" $((RANDOM * 65536 + RANDOM)))

    # Create image with text centered
    convert -size 1366x2048 "xc:$COLOR" \
        -gravity center \
        -fill white -pointsize 200 -font Arial \
        -annotate +0+0 "$i" \
        "output/${i}.jpg"
done
