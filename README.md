# re.play
re.play is an interactive 3D map that allows you to see a heatmap of your Strava activities, and an animation of any activity accompanied by a chart of your performance metrics. 

See below for a quick demo:

https://www.loom.com/share/edef87eb7baa48bba58e1cc185072d4c?sid=49c16670-d4b1-47ea-80f9-6b50248134f4

# notes
The last 30 days is the default period for pulling activities from Strava so you might not see any activities loaded on the map. You can load activities from a custom date range by clicking on the gear icon. The number of activities rendered on the map is capped at 50 to maximize performance.

Some activities might not have valid map coordinates (a treadmill workout, corrupted workout data etc.). You won't see these activities on the map, but you can still find them in the sidebar list.

Depending on your activity recording device, not all metrics might be available. Currently re.play supports heart rate, elevation, pace, cadence, and grade.

# tech
This is a NextJS app deployed on Vercel. 

The map is provided by mapbox-gl. Interactivity and camera is controlled through Uber's react-map-gl library. 

Chart visualizations are built with Airbnb's visx library (a react wrapper around d3)

Authentication with Strava is handled through Next-Auth. Data fetching / caching is handled with react-query. 

# other
feel free to shoot me any feedback, comments, suggestions: raveenreddy89@gmail.com
