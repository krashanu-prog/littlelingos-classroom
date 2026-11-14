# Little Lingos: iPhone and iPad app

This folder turns the published web app (the repo's top folder) into an App Store app using Capacitor. The web app's files are copied inside the app, so it opens instantly and Pip's voice works offline. The live website is not changed by anything here.

## Run it on your Mac (needs Xcode, free from the Mac App Store)

```
cd source/ios-app
npm install
npm run sync
npm run open
```

Xcode opens. Pick an iPhone simulator at the top and press the Play button.

## After the web app changes

Run `npm run sync` again, then build in Xcode. It re-copies the web files into the app.

## What is where

| File | What it does |
|---|---|
| `scripts/sync-web.mjs` | Copies the web app into `www/` and points invite, share and sign-in links at https://classroom.littlelingos.in. It also removes the parent pay panels (Razorpay and UPI), so no payment is taken inside the app; parents still see what is due. It stops with a clear message if the web app changed in a way it doesn't expect. |
| `capacitor.config.json` | App name (Little Lingos) and app ID (`in.littlelingos.classroom`). |
| `ios/` | The Xcode project: icon, launch screen and the permission messages for microphone, speech, camera and photos. |

## Not done yet

- Signing: in Xcode, choose your Apple Developer team under App › Signing & Capabilities.
- Alerts: the web app's browser alerts don't exist inside an iPhone app. Native notifications are the next step.
