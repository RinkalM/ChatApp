
# Simple Socket.io NodeJS, AngularJS Web Chat 

This is a simple socket based web chat app. It's built with NodeJS, Express and SocketIO(version 0.9) on the back-end and jQuery, AngularJS, Bootstrap css and SocketIO on the front-end.
See it in action [here](http://18.188.121.250:3000).

## Set up instructions

1. Install NodeJS
		
2. Clone this repository
	
3. Run npm install
```	
npm install
```
4. Run the server
```
node src\server.js
```
5. Running client
http://localhost:3000/


## How it works

* When you load the application's page for the first time a random username is generated for you. It can be changed on the Settings page at any time.
All settings are saved in local storage and changes will be applied immediately it can be set to defaults by button “Reset to defaults”.

* Now you have to open the Chat page to communicate with people on-line right now. You can close the page or refresh it at any time and your chat will be reloaded for you automatically. The communication is 100% pure Socket.IO. The node server is providing only the static index.html and the sockets continue from there.

* The node application is created to handle multiple channels for every user but currently only one chat can be active on the front-end. 

* The browser's local storage which is available in all modern browsers is used to store your user and chat settings. On the back-end users, channels and messages are kept in arrays, not database but this can be changed to use for example Redis or MongoDB if the application is going to be used by many people at once. 

* It has support for only 2 locales right now.
		
