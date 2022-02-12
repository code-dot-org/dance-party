# Dance Party
[![Build Status](https://github.com/code-dot-org/dance-party/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/code-dot-org/dance-party/actions/workflows/build.yml)
[![codecov](https://codecov.io/gh/code-dot-org/dance-party/branch/main/graph/badge.svg)](https://codecov.io/gh/code-dot-org/dance-party)

Steps to get up and running
```
git clone git@github.com:code-dot-org/dance-party.git
cd dance-party
nvm install
nvm use
npm install
npm run dev
```

At this point the app will be running at localhost:8080. Open the developer tools in Chrome and you can access the API via `nativeAPI.*`

If you want to make changes locally in dance-party and have them show up in your apps build, do the following
- In the dance-party directory `yarn link`
- In the apps directory `yarn link @code-dot-org/dance-party`

This will set up a symlink in apps/node_modules to point at your local changes. Run `npm run build` in dance-party, and then the apps build should pick the changes up next time it builds.

To debug unit tests in the Chrome debugger:
`node --inspect --debug-brk ./node_modules/.bin/tape ./test/unit/*.js`
Open [chrome://inspect](chrome://inspect) in Chrome browser (requires Chrome 55+)
Tap on `inspect` link under "Remote Target"

### Additional build notes

Node 14.17.1 or higher should be used.  This can be achieved by running:
```
nvm use v14.17.1
```

It also appears that Python 2.7 should be used and must be available for installing `node-gyp`.  Techniques may vary, but this worked in one situation:
```
apt-get install python2.7    
ln -s /usr/bin/python2.7 /usr/bin/python 
```

### Adding New Characters
To add a new character to Dance Party, follow the instructions here: https://github.com/code-dot-org/dance-spritesheets to create the spritesheet for the character.

### Effects Testing
`npm run test:visual` uses [pixelmatch](https://github.com/mapbox/pixelmatch#readme) to test for consistency in screenshots between your local branch and an accepted 
baseline. Accepted baselines are saved in `test/visual/fixtures`.
To debug a test failure, run `node ./test/visual/helpers/generateScreenshot.js <effectName> <pathToDirectory>`
to output the local screenshot to the given directory. If a baseline does not exist for a given effect, the screenshot 
from your local branch is saved as the baseline. Effects are drawn with no characters on the screen so effects appear 
the same when drawn as backgrounds or foregrounds.

#### To Add Test Coverage For a New Effects
Add the name of the effect to the list of effects in `backgrounds.js`. Run `npm run test:visual`. 
After a new baseline is generated, manually inspect it to ensure it matches expectations.

#### To Update A Baseline
Delete the accepted baseline. Run `npm run test:visual`. After a new baseline is generated, manually inspect 
it to ensure it matches expectations.

### Publishing a new version

First, ensure you have the `main` branch checked out locally, and that it's up to date.

To publish a new version, the following command should work:
```
npm version 1.0.4
```
With `1.0.4` replaced by the new version number that should be published.

Note: make sure you are logged into `npm` first.  If not, the command may fail with a misleading `E404` error.  You can see if you're logged in with `npm whoami`, and if not logged in, can can use `npm login`.  
