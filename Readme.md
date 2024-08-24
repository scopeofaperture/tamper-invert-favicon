#  Tampermonkey Script to invert Favicon in Dark Browser Themes

this script is based on https://gist.github.com/kuceb/8f07c33a07066d3ba3f903c35bf8918a
but implements caching to prevent excessive drawing on the canvas and fixes the original script a bit

This script likely doesnt work on first pageload but the browser will pick up the changed Favicon after a navigation event.


