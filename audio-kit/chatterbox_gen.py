#!/usr/bin/env python3
"""Records Wisebyte Go episodes with Chatterbox Turbo (Resemble AI, MIT licence) on an NVIDIA graphics card.

Same scripts and output format as generate.py, so the app needs no change: every sentence is rendered,
joined with natural pauses, encoded as small AAC (24 kHz mono) and timed for the live transcript.
The two narrators are set by reference clips in audio-kit/voices/ (chosen with --samples).

Usage:
    python audio-kit/chatterbox_gen.py --samples              one short lesson clip per candidate voice -> audio-kit/samples/
    python audio-kit/chatterbox_gen.py                        every episode not yet recorded with Chatterbox
    python audio-kit/chatterbox_gen.py s-ai-1 --limit 3       just these / the next few
Voices used for full recording: audio-kit/voices/female.wav and audio-kit/voices/male.wav.
"""
import json, os, re, subprocess, sys, tempfile, time
import numpy as np
import soundfile as sf
import torch

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPTS, OUT, VOICE_DIR, SAMPLES = (os.path.join(HERE, d) for d in ("scripts", "out-cb", "voices", "samples"))
FILES = {"f": "af_heart", "m": "am_michael"}          # file names the app already expects for female / male
REFS = {"f": "female.wav", "m": "male.wav"}
RATE = 24000
PAUSE = {"title": 0.9, "head": 1.1, "ps": 0.6, "s": 0.28, "q": 2.6, "a": 1.0, "end": 0.6}
LEAD = 0.3
SAMPLE_UNITS = "s-ai-1"


def load_model():
    if not torch.cuda.is_available():
        sys.exit("No NVIDIA graphics card found by PyTorch, so Chatterbox would be far too slow here.")
    from chatterbox.tts_turbo import ChatterboxTurboTTS
    print("Graphics card:", torch.cuda.get_device_name(0))
    return ChatterboxTurboTTS.from_pretrained(device="cuda")


def trim(w, thresh=0.01):
    """drop the model's own leading/trailing silence so our pauses stay even"""
    idx = np.where(np.abs(w) > thresh)[0]
    if not len(idx): return w
    a, b = max(0, idx[0] - int(0.03 * RATE)), min(len(w), idx[-1] + int(0.08 * RATE))
    return w[a:b]


def say(model, text, tries=3):
    for k in range(tries):
        with torch.inference_mode():
            w = model.generate(text, temperature=0.7 if k == 0 else 0.6).squeeze(0).cpu().numpy().astype(np.float32)
        w = trim(w)
        secs, words = len(w) / RATE, max(1, len(text.split()))
        # guard against the occasional mumble or runaway: roughly 1.5 to 5 words a second is normal speech
        if 0.18 * words <= secs <= 0.75 * words + 1.5: return w
    return w


def render(model, units):
    parts, at, t = [np.zeros(int(LEAD * RATE), np.float32)], [], LEAD
    for i, u in enumerate(units):
        if u.get("ps") and i:
            g = np.zeros(int(PAUSE["ps"] * RATE), np.float32); parts.append(g); t += len(g) / RATE
        at.append(round(t, 2))
        w = say(model, u["t"]); parts.append(w); t += len(w) / RATE
        g = np.zeros(int(PAUSE.get(u["k"], PAUSE["s"]) * RATE), np.float32); parts.append(g); t += len(g) / RATE
    return np.concatenate(parts), at


def encode(samples, path, kbps=24):
    peak = float(np.max(np.abs(samples))) or 1.0
    samples = samples * min(1.0, 0.95 / peak)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        sf.write(tmp.name, samples, RATE)
    try:
        args = ["ffmpeg", "-y", "-loglevel", "error", "-i", tmp.name, "-ac", "1", "-ar", str(RATE)]
        args += ["-c:a", "aac", "-b:a", f"{kbps}k", "-movflags", "+faststart"] if path.endswith(".mp4") else ["-b:a", "96k"]
        subprocess.run(args + [path], check=True)
    finally:
        os.unlink(tmp.name)


GO = os.path.join(os.path.dirname(HERE), "go", "audio")


def script_for(eid):
    """lesson episodes and corrected originals have a script; the other Go originals keep theirs in go/audio"""
    for p in (os.path.join(SCRIPTS, eid + ".json"), os.path.join(GO, eid + ".json")):
        if os.path.exists(p): return json.load(open(p, encoding="utf-8"))
    raise FileNotFoundError(eid)


def all_ids():
    ids = {f[:-5] for f in os.listdir(SCRIPTS) if f.endswith(".json")}
    m = json.load(open(os.path.join(GO, "manifest.json"), encoding="utf-8"))["episodes"]
    ids |= {k for k, x in m.items() if not x.get("base") and os.path.exists(os.path.join(GO, k + ".json"))}
    return sorted(ids, key=lambda e: (not e.startswith("s-") and not e.startswith("inner"), e))


def samples(model):
    os.makedirs(SAMPLES, exist_ok=True)
    s = json.load(open(os.path.join(SCRIPTS, SAMPLE_UNITS + ".json"), encoding="utf-8"))
    units = s["units"][2:9]
    refs = sorted(f for f in os.listdir(VOICE_DIR) if f.startswith("ref-") and f.endswith(".wav"))
    builtin = model.conds
    for f in [None] + refs:
        name = "builtin" if f is None else f[4:-4]
        if f is None: model.conds = builtin
        else: model.prepare_conditionals(os.path.join(VOICE_DIR, f))
        m = model
        t0 = time.time(); audio, _ = render(m, units)
        encode(audio, os.path.join(SAMPLES, f"sample-{name}.mp3"))
        print(f"sample-{name}.mp3: {len(audio) / RATE:.0f}s of audio in {time.time() - t0:.0f}s")


VOICE_TESTS = [("vt-f1", "Female 1", "ref-af_heart.wav"), ("vt-f2", "Female 2", "ref-af_bella.wav"),
               ("vt-f3", "Female 3 (British)", "ref-bf_emma.wav"), ("vt-f4", "Female 4", None),
               ("vt-m1", "Male 1", "ref-am_michael.wav"), ("vt-m2", "Male 2", "ref-am_fenrir.wav"),
               ("vt-m3", "Male 3 (British)", "ref-bm_george.wav"), ("vt-m4", "Male 4 (British)", "ref-bm_fable.wav")]


def voice_tests(model):
    """the opening part of AI episode 1 in every candidate voice, as short test episodes for the app"""
    os.makedirs(OUT, exist_ok=True)
    s = script_for(SAMPLE_UNITS)
    units = [u for u in s["units"] if u["c"] <= 0]
    mpath = os.path.join(OUT, "manifest.json")
    manifest = json.load(open(mpath, encoding="utf-8")) if os.path.exists(mpath) else {"v": 1, "episodes": {}}
    builtin = model.conds
    for eid, name, ref in VOICE_TESTS:
        t0 = time.time()
        if ref: model.prepare_conditionals(os.path.join(VOICE_DIR, ref))
        else: model.conds = builtin
        audio, at = render(model, units)
        dur = round(len(audio) / RATE, 1); size = {}
        for v in ("f", "m"):
            path = os.path.join(OUT, f"{eid}-{FILES[v]}.mp4")
            encode(audio, path); size[v] = os.path.getsize(path)
        json.dump({"chapters": s["chapters"][:1], "units": units, "at": {"f": at, "m": at}, "dur": {"f": dur, "m": dur}},
                  open(os.path.join(OUT, eid + ".json"), "w", encoding="utf-8"), separators=(",", ":"))
        manifest["episodes"][eid] = {"dur": {"f": dur, "m": dur}, "size": size, "t": name}
        json.dump(manifest, open(mpath, "w", encoding="utf-8"), indent=1)
        print(f"{eid} ({name}): {dur / 60:.1f} min in {(time.time() - t0) / 60:.1f} min")


def main(argv):
    model = load_model()
    if "--samples" in argv: return samples(model)
    if "--voice-tests" in argv: return voice_tests(model)
    os.makedirs(OUT, exist_ok=True)
    limit = None
    if "--limit" in argv:
        i = argv.index("--limit"); limit = int(argv[i + 1]); del argv[i:i + 2]
    for v, f in REFS.items():
        if not os.path.exists(os.path.join(VOICE_DIR, f)): sys.exit(f"Missing audio-kit/voices/{f}: pick the narrators first.")
    ids = argv or all_ids()
    mpath = os.path.join(OUT, "manifest.json")
    manifest = json.load(open(mpath, encoding="utf-8")) if os.path.exists(mpath) else {"v": 1, "episodes": {}}
    todo = [e for e in ids if argv or e not in manifest["episodes"]]
    if limit: todo = todo[:limit]
    print(f"{len(todo)} episode(s) to record")
    for n, eid in enumerate(todo, 1):
        t0 = time.time()
        s = script_for(eid)
        at, dur, size = {}, {}, {}
        for v in ("f", "m"):
            model.prepare_conditionals(os.path.join(VOICE_DIR, REFS[v]))
            audio, at[v] = render(model, s["units"])
            dur[v] = round(len(audio) / RATE, 1)
            path = os.path.join(OUT, f"{eid}-{FILES[v]}.mp4")
            encode(audio, path); size[v] = os.path.getsize(path)
        json.dump({"chapters": s.get("chapters", []), "units": s["units"], "at": at, "dur": dur},
                  open(os.path.join(OUT, eid + ".json"), "w", encoding="utf-8"), separators=(",", ":"))
        manifest["episodes"][eid] = {"dur": dur, "size": size, "h": s.get("h", "")}
        json.dump(manifest, open(mpath, "w", encoding="utf-8"), indent=1)
        print(f"[{n}/{len(todo)}] {eid}: {dur['f'] / 60:.1f} min, recorded in {(time.time() - t0) / 60:.1f} min")


if __name__ == "__main__":
    main(sys.argv[1:])
