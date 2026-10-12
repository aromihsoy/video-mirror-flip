Mirrors (flips) video horizontally on any website with **Alt + M**. Press it again to restore the original orientation.

Handy when a video was uploaded mirrored, or when you just want to flip a video, for example to follow a tutorial from another angle.

## Usage

1. Install the script.
2. Open a page with a video.
3. Press **Alt + M**. If there are several videos on the page, all of them are mirrored.

## Features

- Works on any website
- Layout-independent: works with any keyboard layout (it uses the physical key)
- Finds videos inside Shadow DOM
- Picks up videos that load later (next episode, player change)
- The notification is visible in fullscreen mode too
- Does not interfere with typing and ignores key repeat

## Known limitations

- Videos inside an iframe: the key works only in the frame that currently has focus. Clicking the video usually helps.
- Videos inside a closed Shadow DOM are not accessible to the script.
- Canvas and WebGL players are not supported: the effect is applied to the `<video>` tag only.
- The Picture-in-Picture window may not be mirrored.
- Requires a browser that supports the CSS `scale` property (Chrome 104+, Firefox 72+, Safari 14.1+).

## Source code and feedback

Repository: https://github.com/aromihsoy/video-mirror-flip

If the script does not work on some website, open an issue in the repository and include the page address.
