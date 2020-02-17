hacli is an interactive command line client for your home assistant instance.

## Installing

```
yarn global add hacli
```

or

```
npm install -g hacli
```

## Start

`hacli`

## Usage

The first time you run hacli, it will prompt your to offer hass url & long-lived access token. The reulst will be saved in configuration file named '.haclirc.yaml' in your home directory. You can edit it with your like.
After you logged in successfully, it will show you the dashboard which is composed of three blocks:

-   Entity List (focusable) - the right one
-   Entity Panel (focusable) - the left-top one
-   History List (unfocusable) - the left-bottom one

### Entity List

Entity List shows all your entities by alph order of it's id: type + '.' + name.
So entities with same type are next to each other.
Entity List is focused by default, you can navigate with arrow keys:

-   up/k - up
-   down/j - down
-   left/h - focus Entity Panel
-   space - toggle the state of current entity if supported
-   / (the slash key) - jump to next type

### Entity Panel

Entity Panel shows detail operations of current selected entity in Entity List.

-   up/k - up
-   down/j - down
-   left/h - left
-   right/l - right, or focus back to Entity List if no item at right side
-   enter/space - select

### History List

History List show the lastest items of the past 24 hours.

### Global Keys

shift-left/shift-h: focus Entity Panel
shift-right/shift-l: focus Entity List
esc/q/ctrl+c: quit

## supported features

### climate

-   set havc mode
-   set target temperature
-   set fan mode
-   set swing mode

### light

-   set state (on/off)
-   set brightness
-   set color temp
-   set rgb color

### cover

-   set state (open/closed)
-   set position

### media_player

-   set state (on/off)
-   volume up/down

### vacuum

-   set state (on/off)
-   pause/resume
-   stop
-   locate
-   home

## Development

There are still some unsupported features due to my devices limitation.
To help implete it, follows:

-   run `yarn` to install dependencies
-   run `yarn build` to build src code
-   run `node dist/index` to start the application
