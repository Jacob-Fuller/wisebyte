# Wisebyte audio kit

Records the audio episodes for the Wisebyte Go tab and publishes them to the app.

## How the content fits together

```
Episode (Wisebyte Go, ~12-20 min)
  └─ 3-4 lessons (the reading app)
       └─ 5 teaching points each (the lesson's pages)
            └─ one Scroll card per teaching point
```

Every lesson in the library belongs to exactly one episode. `native/scripts/build-audio.js` groups them:
each Compendium course is split into episodes of 3-4 lessons in course order, lessons outside every
course are grouped by topic ("Psychology Shorts"), and the Inner Circle lessons get locked episodes of
their own. It writes a narration script for every episode into `scripts/`.

The app only shows episodes that have a recording. Which ones do is listed in `go/audio/manifest.json`,
which the app reads every time it opens. So a new recording appears in the app without an app update.

## Recording

One-time setup on the computer that will do the recording (a recent Windows or Mac laptop is fine; a GPU makes it much faster):

```
pip install kokoro-onnx soundfile numpy
```

Download `kokoro-v1.0.onnx` and `voices-v1.0.bin` from
https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 into `audio-kit/model/`,
and make sure `ffmpeg` is installed.

Then, from the repo folder:

```
python audio-kit/generate.py                 # every episode not yet recorded
python audio-kit/generate.py --limit 10      # the next ten
python audio-kit/generate.py s-psychology-1  # specific episodes
```

Each episode is recorded in both narrators (Heart and Michael, the same voices as Wisebyte - Go).
You can stop at any time; finished episodes are kept and skipped next run.
The full library is roughly 60 hours of narration per voice.

## Publishing

**While the library is small (GitHub):**

1. Copy everything in `audio-kit/out/` except `manifest.json` into `go/audio/`.
2. Run `node native/scripts/build-audio.js`. It adds the new recordings to `go/audio/manifest.json`.
3. Commit and push to `main`. The app picks them up the next time it opens.

**For the full library (Cloudflare R2, recommended):** the whole library is about 1.5 GB, too much for the
GitHub repo, and R2 doesn't charge for streaming.

1. Create a free Cloudflare account, then an R2 bucket (for example `wisebyte-audio`) and turn on its public `r2.dev` URL.
2. Upload everything in `audio-kit/out/` except `manifest.json` to the bucket (drag and drop in the dashboard works, or `rclone copy audio-kit/out r2:wisebyte-audio`).
3. Run `AUDIO_BASE=https://pub-xxxx.r2.dev/ node native/scripts/build-audio.js` with your bucket's URL (ending in `/`).
   The new episodes are listed in `go/audio/manifest.json` with that address.
4. Commit and push `go/audio/manifest.json`.

The manifest stays on GitHub; only the audio files move. To move every file to R2 later, upload the
contents of `go/audio/` too and set `"base"` at the top of `go/audio/manifest.json` to the R2 URL.

## When lessons change

If a course gains or loses lessons, its episodes are regrouped. A recording made for a different set of
lessons is dropped from the manifest automatically (build-audio.js says which), so re-record those episodes.
Small wording fixes inside a lesson don't need a new recording.
