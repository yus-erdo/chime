# chime
Take a break away from your computer regularly using this app. You can customise the active/break times as you want to achieve a balanced screen time. 

# why
I used to use an app called Bowl which would give bell like sound when I have been in front my computer too long. But then it was discontinued.  So I made this app so I remember to take a bit of time off to reset my mind and my body. I find myself at better solving complex problems just after a break... So here it is; so you can use it too...

# how does it work
This app monitors active system state and gives you notifications when you have been active too long. It monitors the active system time by using a native extension to node, which simply detects keyboard and mouse activity. So as long as you are using your keyboard and mouse it thinks you are active. If you are not using your keyboard and mouse long enough (therefore most like you are away) it takes this as a break. When you set your break time to 5 mins or so; inactivity of around 5 mins very most like you are away. As per my personal experience I definitely end up using my keyboard or mouse in 5 mins.

# download
https://github.com/erdogany/chime/releases/download/v0.1/chime.zip

# build
You can just download the already packaged macOS app from releases. This is the easiest option. You then obviously need to give permission to be run and allow notifications. The pre-built app is not signed. 

Or you can clone the code and built yourself:

After cloning install dependencies:
```
$ npm install
```

Run the app in development mode:

```
$ npm start
```

Package the app for macOs:

```
npm run pack-macos
```

# screenshots

![how notification looks](https://github.com/erdogany/chime/blob/master/assets/ss-0.png?raw=true)


![how app looks](https://github.com/erdogany/chime/blob/master/assets/ss-1.png?raw=true)


![how app looks](https://github.com/erdogany/chime/blob/master/assets/ss-2.png?raw=true)

![how app looks](https://github.com/erdogany/chime/blob/master/assets/ss-3.png?raw=true)


App Icon By:
https://www.flaticon.com/authors/freepik

test-release-4
