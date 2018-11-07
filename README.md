[![travis-ci](https://travis-ci.org/code-dot-org/dance-party.svg?branch=master)](https://travis-ci.org/code-dot-org/dance-party/builds)
[![codecov](https://codecov.io/gh/code-dot-org/dance-party/branch/master/graph/badge.svg)](https://codecov.io/gh/code-dot-org/dance-party)

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
