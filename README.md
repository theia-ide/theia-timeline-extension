# timeline-extension
An example of a Theia-based extension using the [timeline-chart library](https://github.com/theia-ide/timeline-chart).

## Open in Gitpod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/theia-ide/theia-timeline-extension)

It will build and open the theia app automatically.

Here just open the `timeline-data.json` with `Open timeline`

## Create your own timeline-data.json
Copy your script to profile into the example folder

    cd example
    node --prof your-script.js

This will create an `isolate-XYZ-v8.log`

    node --prof-process --preprocess isolate-XYZ-v8.log | ./data-converter.js

That will create the `timeline-data.json` which can `open with` -> `Open Timeline``


## Run the app locally

## Getting started

Install [nvm](https://github.com/creationix/nvm#install-script).

    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.5/install.sh | bash

Install npm and node.

    nvm install 8
    nvm use 8

Install yarn.

    npm install -g yarn

## Build the app

    yarn

## Running the browser example

    yarn rebuild:browser
    cd browser-app
    yarn start

Open http://localhost:3000 in the browser and here open the example folder of this project.
Then open timeline-data.json with Timeline.

## Running the Electron example

    yarn rebuild:electron
    cd electron-app
    yarn start

Here open the example folder of this project.
Then open timeline-data.json with Timeline.

