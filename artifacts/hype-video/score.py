#!/usr/bin/env python3
"""COW CODE HYPE SCORE — synthesized from first principles in a barn at 3am."""
import numpy as np, wave, sys, os

SR = 48000
DUR = 34.133
N = int(SR * DUR)
t = np.arange(N) / SR
S = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(S, 'audio')

# ---- section marks (video-locked) ----
S01, S02, S03, S04, S05, S06, S07, S08, S09, END = 0.0, 2.7, 5.5, 11.1, 12.3, 15.633, 19.633, 24.567, 28.133, 34.133
BOOM = S08 + 2.71          # chungus explosion
BPM = 132.0
BEAT = 60.0 / BPM

def sec(a, b):
    """1.0 inside [a,b), 0 outside, 8ms ramps."""
    r = int(0.008 * SR)
    x = np.zeros(N)
    ia, ib = max(0, int(a * SR)), min(N, int(b * SR))
    if ib <= ia: return x
    x[ia:ib] = 1.0
    if ia + r < N: x[ia:ia + r] = np.linspace(0, 1, r)
    if ib - r > 0: x[ib - r:ib] = np.linspace(1, 0, r)
    return x

def env_per(period, decay, phase=0.0):
    """exp decay retriggered every `period` seconds."""
    tt = np.mod(t - phase, period)
    return np.exp(-decay * tt)

# ---- KICK: 4-on-floor, pitch-dropping sine ----
ph = np.mod(t, BEAT)
kick_body = np.sin(2 * np.pi * (38 + 85 * np.exp(-ph * 28)) * ph) * np.exp(-9 * ph)
kick_click = np.random.default_rng(7).standard_normal(N) * np.exp(-120 * ph) * 0.4
kick4 = (kick_body + kick_click) * 0.95
# half-time kick (beats 1&3)
ph2 = np.mod(t, 2 * BEAT)
kick_half = (np.sin(2 * np.pi * (38 + 85 * np.exp(-ph2 * 28)) * ph2) * np.exp(-9 * ph2)) * 0.95
kick_gate = sec(S03, S04) + sec(S05, S07) + sec(S07 + 1.8, BOOM)
kick_half_gate = sec(S02, S03) * 0.8 + sec(S07, S07 + 1.8) + sec(S09 + 0.3, END - 0.6) * 0.55
KICK = kick4 * kick_gate + kick_half * kick_half_gate
kickenv = np.exp(-10 * ph)  # for sidechain

# ---- HATS: offbeat noise ticks ----
rng = np.random.default_rng(11)
noise = rng.standard_normal(N)
hat_env = env_per(BEAT, 55, phase=BEAT / 2)
hat = noise * hat_env
# crude high-pass: differentiate
hat = np.diff(hat, prepend=0.0) * 6.0
HATS = hat * 0.30 * (sec(S03, S04) + sec(S05, S07) + sec(S07 + 1.8, BOOM))

# ---- CLAP on beats 2 & 4 ----
clap_env = env_per(2 * BEAT, 40, phase=BEAT)
clap = np.diff(noise * clap_env, prepend=0.0) * 4.0
CLAP = clap * 0.35 * (sec(S03, S04) + sec(S05, BOOM))

# ---- BASS: 8th-note A-minor stomp, sidechained ----
bar = 4 * BEAT
eighth = BEAT / 2
notes = [55.0, 55.0, 55.0, 110.0, 65.41, 65.41, 73.42, 73.42]  # A1 A1 A1 A2 C2 C2 D2 D2
step = np.floor(np.mod(t, bar) / eighth).astype(int) % 8
freq = np.array(notes)[step]
phase_acc = np.cumsum(2 * np.pi * freq / SR)
saw = 2 * (np.mod(phase_acc / (2 * np.pi), 1.0)) - 1
sq = np.sign(np.sin(phase_acc))
bass_raw = (0.6 * saw + 0.4 * sq)
gate8 = env_per(eighth, 14)
duck = 1 - 0.6 * kickenv
BASS = bass_raw * gate8 * duck * 0.34 * (sec(S03, S04) + sec(S05, S07) + sec(S07 + 1.8, BOOM))
# rising madness through chungus: pitch LFO adds mania
mania = 1 + 0.15 * np.clip((t - S08) / (BOOM - S08), 0, 1) * np.sin(2 * np.pi * 6 * t)
BASS *= np.where((t > S08) & (t < BOOM), mania, 1.0)

# ---- PAD: dark Am drone for intro/prophecy/outro ----
def detsaw(f, det):
    p1 = np.cumsum(2 * np.pi * f * (1 + det) / SR * np.ones(N))
    p2 = np.cumsum(2 * np.pi * f * (1 - det) / SR * np.ones(N))
    return (np.mod(p1 / (2 * np.pi), 1) - 0.5) + (np.mod(p2 / (2 * np.pi), 1) - 0.5)
pad = detsaw(110, 0.004) + detsaw(130.81, 0.005) + detsaw(164.81, 0.003)
# crude low-pass via cumulative smoothing
alpha = 0.06
padf = np.copy(pad)
for _ in range(2):
    padf = np.concatenate([[padf[0]], alpha * padf[1:] + (1 - alpha) * padf[:-1]])
    for i in range(1, 4): pass
# proper one-pole
y = np.zeros(N); acc = 0.0
for i in range(N):
    acc += 0.045 * (pad[i] - acc)
    y[i] = acc
PAD = y * 0.30 * (sec(0.9, S03) + sec(S09, END - 0.3) * 0.8)

# ---- BRAAM at 0 ----
braam_t = np.clip(t, 0, 2.2)
br = np.zeros(N)
for f in (55, 55.7, 110, 82.5):
    br += np.sign(np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.7 * t)))
BRAAM = br * np.exp(-1.6 * t) * 0.22

# ---- title impact at 0.95 ----
ti = 0.95
tt2 = np.clip(t - ti, 0, None)
IMPACT = (np.sin(2 * np.pi * (30 + 100 * np.exp(-tt2 * 18)) * tt2) * np.exp(-5 * tt2)
          + rng.standard_normal(N) * np.exp(-22 * tt2) * 0.5) * (t >= ti) * 0.9

# ---- record scratch + alarm (turtle) ----
st = S04
tt3 = np.clip(t - st, 0, None)
scr_f = 900 * np.exp(-6 * tt3) + 60
SCRATCH = (np.sin(2 * np.pi * scr_f * tt3) * 0.5 + rng.standard_normal(N) * 0.3) * np.exp(-8 * tt3) * (t >= st) * ((t < S05)) * 0.8
alarm = np.sign(np.sin(2 * np.pi * 620 * t)) * env_per(0.25, 30) * 0.10 * sec(S04 + 0.25, S05)

# ---- risers ----
def riser(a, b, f0=180, f1=1400, g=0.30):
    m = sec(a, b)
    u = np.clip((t - a) / max(b - a, 1e-6), 0, 1)
    f = f0 + (f1 - f0) * u * u
    x = np.sin(np.cumsum(2 * np.pi * f / SR)) + 0.5 * rng.standard_normal(N) * u
    return x * m * g * u
RISERS = riser(4.7, S03) + riser(S06 - 1.0, S06, g=0.22) + riser(23.4, S08, g=0.34) + riser(BOOM - 1.6, BOOM, f0=120, f1=2000, g=0.30)

# ---- snare roll into chungus ----
roll_env = env_per(BEAT / 4, 70)
ROLL = np.diff(noise * roll_env, prepend=0.0) * 5.0 * 0.30 * sec(S08 - 1.0, S08)
# denser roll before boom
roll2 = np.diff(noise * env_per(BEAT / 8, 90), prepend=0.0) * 5.0 * 0.26 * sec(BOOM - 0.9, BOOM)

# ---- THE BOOM ----
bt = np.clip(t - BOOM, 0, None)
BOOMS = ((np.sin(2 * np.pi * (24 + 70 * np.exp(-bt * 6)) * bt) * np.exp(-2.2 * bt)) * 1.2
         + rng.standard_normal(N) * np.exp(-3.5 * bt) * 0.8) * (t >= BOOM)
BOOMS *= 0.9

# ---- assemble music bed (mono) ----
bed = KICK + HATS + CLAP + BASS + PAD + BRAAM + IMPACT + SCRATCH + alarm + RISERS + ROLL + roll2 + BOOMS

# ---- overlay samples ----
def load(name):
    with wave.open(os.path.join(A, name), 'rb') as w:
        assert w.getframerate() == SR, name
        d = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768.0
        if w.getnchannels() == 2: d = d.reshape(-1, 2).mean(axis=1)
        return d

def place(buf, x, at, gain=1.0, speed=1.0):
    if speed != 1.0:
        n2 = int(len(x) / speed)
        x = np.interp(np.linspace(0, len(x) - 1, n2), np.arange(len(x)), x)
    i = int(at * SR)
    j = min(N, i + len(x))
    if i < N: buf[i:j] += x[:j - i] * gain

VOICES = np.zeros(N)
place(VOICES, load('v_cowcode.wav'), 0.12, 2.0)
place(VOICES, load('moo_real.wav'), 0.55, 1.35)
place(VOICES, load('v_world.wav'), 2.85, 2.4)
place(VOICES, load('v_local.wav'), 7.90, 1.9)
place(VOICES, load('v_you.wav'), 11.12, 2.0)
place(VOICES, load('v_spins.wav'), 13.15, 1.9)
place(VOICES, load('v_prs.wav'), 15.75, 1.8, speed=1.18)
place(VOICES, load('v_tab.wav'), 19.80, 2.0)
place(VOICES, load('v_song.wav'), 28.40, 1.7, speed=1.15)
place(VOICES, load('moo_real.wav'), 32.30, 1.6, speed=0.82)

BEDS = np.zeros(N)
place(BEDS, load('tabmoo_bed.wav'), S07, 1.0)
place(BEDS, load('chungus_bed.wav'), S08, 1.15)

mix = bed * 0.55 + VOICES * 0.95 + BEDS * 0.9

# ---- master ----
mix = np.tanh(mix * 1.25) * 0.9
# end fade
fade = np.ones(N)
fs = int(33.5 * SR)
fade[fs:] = np.linspace(1, 0, N - fs)
mix *= fade
mix = mix / np.max(np.abs(mix)) * 0.92

# stereo: tiny haas width on the bright stuff
right = np.copy(mix)
shift = int(0.006 * SR)
bright = (HATS + CLAP) * 0.15
right[shift:] += bright[:-shift]
left = mix + bright * 0.0
stereo = np.stack([left, right], axis=1)
stereo = np.clip(stereo, -1, 1)

out = os.path.join(S, 'score.wav')
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
print('WROTE', out, f'{DUR}s')
