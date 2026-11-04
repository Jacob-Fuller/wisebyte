#!/usr/bin/env python3
"""Records Wisebyte audio episodes with the Kokoro voice model (the same voices as Wisebyte - Go).

For each script in audio-kit/scripts/ it renders every sentence in both narrator voices, joins them with
natural pauses, encodes a small AAC file (24 kHz mono, ~20 kbps) and records when each sentence starts,
so the app can show a live transcript, chapters and resume points.

Output goes to audio-kit/out/:
    <episode>-af_heart.mp4, <episode>-am_michael.mp4   the recordings
    <episode>.json                                     chapters, transcript units and timings
    manifest.json                                      merged list of every recorded episode
Upload the contents of audio-kit/out/ to the audio host (see README.md). Already-recorded episodes are skipped,
so you can stop and restart at any time.

Setup (once):
    pip install kokoro-onnx soundfile numpy
    download kokoro-v1.0.onnx and voices-v1.0.bin from
    https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 into audio-kit/model/
    ffmpeg must be on your PATH.
Usage:
    python audio-kit/generate.py                     every episode not yet recorded
    python audio-kit/generate.py s-world-history-1   just these episodes
    python audio-kit/generate.py --limit 10          the next ten
"""
import json, os, subprocess, sys, tempfile, time
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPTS, OUT, MODEL = (os.path.join(HERE, d) for d in ("scripts", "out", "model"))
VOICES = {"f": "af_heart", "m": "am_michael"}
RATE = 24000
SPEED = 1.0
PAUSE = {"title": 0.9, "head": 1.1, "ps": 0.65, "s": 0.32, "q": 2.6, "a": 1.0, "end": 0.6}   # seconds of silence after each kind
LEAD = 0.3


def render(kokoro, units, voice):
    """returns (samples, start time of every unit)"""
    parts, at, t = [np.zeros(int(LEAD * RATE), dtype=np.float32)], [], LEAD
    for i, u in enumerate(units):
        # a little extra air before a new paragraph or part
        if u.get("ps") and i:
            gap = np.zeros(int(PAUSE["ps"] * RATE), dtype=np.float32); parts.append(gap); t += len(gap) / RATE
        at.append(round(t, 2))
        audio, sr = kokoro.create(u["t"], voice=voice, speed=SPEED, lang="en-gb" if voice.startswith("b") else "en-us")
        assert sr == RATE
        parts.append(audio.astype(np.float32)); t += len(audio) / RATE
        gap = np.zeros(int(PAUSE.get(u["k"], PAUSE["s"]) * RATE), dtype=np.float32); parts.append(gap); t += len(gap) / RATE
    return np.concatenate(parts), at


def encode(samples, path):
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        sf.write(tmp.name, samples, RATE)
    try:
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp.name, "-ac", "1", "-ar", str(RATE), "-c:a", "aac", "-b:a", "20k", "-movflags", "+faststart", path], check=True)
    finally:
        os.unlink(tmp.name)


def main(argv):
    os.makedirs(OUT, exist_ok=True)
    limit = None
    if "--limit" in argv:
        i = argv.index("--limit"); limit = int(argv[i + 1]); del argv[i:i + 2]
    ids = argv or sorted(f[:-5] for f in os.listdir(SCRIPTS) if f.endswith(".json"))
    mpath = os.path.join(OUT, "manifest.json")
    manifest = json.load(open(mpath, encoding="utf-8")) if os.path.exists(mpath) else {"v": 1, "episodes": {}}
    todo = [e for e in ids if argv or e not in manifest["episodes"]]
    if limit: todo = todo[:limit]
    print(f"{len(todo)} episode(s) to record")
    kokoro = Kokoro(os.path.join(MODEL, "kokoro-v1.0.onnx"), os.path.join(MODEL, "voices-v1.0.bin"))
    for n, eid in enumerate(todo, 1):
        t0 = time.time()
        s = json.load(open(os.path.join(SCRIPTS, eid + ".json"), encoding="utf-8"))
        at, dur, size = {}, {}, {}
        for v, voice in VOICES.items():
            samples, at[v] = render(kokoro, s["units"], voice)
            dur[v] = round(len(samples) / RATE, 1)
            path = os.path.join(OUT, f"{eid}-{voice}.mp4")
            encode(samples, path); size[v] = os.path.getsize(path)
        json.dump({"chapters": s["chapters"], "units": s["units"], "at": at, "dur": dur}, open(os.path.join(OUT, eid + ".json"), "w", encoding="utf-8"), separators=(",", ":"))
        manifest["episodes"][eid] = {"dur": dur, "size": size, "h": s.get("h", "")}
        json.dump(manifest, open(mpath, "w", encoding="utf-8"), indent=1)   # saved after every episode, so a stopped run loses nothing
        print(f"[{n}/{len(todo)}] {eid}: {dur['f'] / 60:.1f} min, recorded in {(time.time() - t0) / 60:.1f} min")


if __name__ == "__main__":
    main(sys.argv[1:])
