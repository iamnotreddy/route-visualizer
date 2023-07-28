# re.play
re.play is an interactive map with 3D terrain that lets you see a heatmap of your Strava activities within any timeframe. You can also watch an animation of any individual activity accompanied by charts of your performance metrics. 

See below for a quick demo

https://www.loom.com/share/edef87eb7baa48bba58e1cc185072d4c

# motivation
I spent a lot of time last summer running around the Palos Verdes Peninsula near LA. The landscape is gorgeous - steep, rolling hills that drop right into the Pacific Ocean. I didn't feel like Strava's native map did the terrain justice. I also wanted to see an animated rendering of my runs against charts of my performance metrics - i.e additional context into how my surroundings were affecting my running performance. 

#### some fun use cases:
* runs / hikes from past vacations: I found some cool hikes I did near Crater Lake and mountains nearby Toluca
* training and leadup to races: enjoyed looking at how I trained leading up to the SF marathon
* bike rides in hilly terrain: not much of a cyclist myself but I see my friends biking in very cool areas
* finding spots to eat / drink around your runs: I have a places / locations layer enabled in this map so different establishments will pop up during the animation. I recently spent some time in East London and spotted some cool pubs along my runs in Victoria Park / the old Olympic village

# notes
re.play reads directly from Strava. Nothing is saved to a database. I don't want anything to do with your data!

The default period is set to the last 30 days so you might not see any activities on the map. You can change the time period by clicking on the gear icon. Activities are capped at 50 to maximize performance.

The map terrain is set to an exaggeration of 4.5. I found this to more closely match my visual perception of the terrain in places I spend a lot of time working out. The relatively subtle climbs of Manhattan's UWS and the steep cliffs of the Jersey Palisades feel more accurately represented than in Strava's native 3D map. Interstate 280 around Hillsborough looks a bit absurd though.  ¯\_(ツ)_/¯ 

Some activities might not have valid map coordinates (a treadmill workout, corrupted workout data etc.). You won't see these on the map, but you can still find them in the sidebar list.

Depending on the device you use (Apple Watch, Garmin etc.), not all metrics might be available. Currently re.play supports heart rate, elevation, pace, cadence, and grade. 

I cap the number of data points at 1k - above this threshold is where FPS seems visbily affecting during animations and map interactivity. For activities > 1k data points, I sample at an even interval. 

# tech
This is a NextJS app deployed on Vercel. 

The map is provided by mapbox-gl. Interactivity and camera is controlled through [react-map-gl](https://visgl.github.io/react-map-gl/).

Chart visualizations are built with [visx](https://airbnb.io/visx/) (a react wrapper around d3)

Strava Authentication is handled through [Next-Auth](https://next-auth.js.org). Data fetching / caching is handled by [react-query](https://tanstack.com/query/v3/). 

# other
feel free to shoot me any feedback, comments, suggestions: raveenreddy89@gmail.com
