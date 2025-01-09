# react-vertical-scrolling-app
 
Some context about this project: A few months ago I started digging more into React and I started working on a "vertical scrolling app" (think of the likes of TikTok, but web-based) with basic features such as scrolling up/down to new/previous videos, liking videos, counting views and switching audio on/off.

There's a slightly refined version of this live (I won't mention the domain for privacy purposes) - but in terms of infrastructure:

Runs on a container hosted via AWS (runs the React bits) with process(es) managed by pm2. Then I use a nginx set up as reverse proxy to serve requests to the web.