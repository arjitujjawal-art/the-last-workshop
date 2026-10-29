# The Last Workshop

**Some machines still have a story.** A playable museum of lost signals, built by Arjit Ujjawal for **Ghost in the Machine / Hacktoberfest 2026**.

[Open the workshop](https://arjitujjawal-art.github.io/the-last-workshop/) · [Challenge](https://dev.to/challenges/hacktoberfest-week4-2026-10-26)

Restore an AM radio, recover a Morse transmission, and reconnect a two-tone modem. An open-weight model proposes adjustments. The visitor approves them. Real signal processing determines whether they worked.

## Run locally — free

Requires Node 22.12+ (Node 24 recommended). No Python, API key, database, or paid service.

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:4173**. For local AI, install [Ollama](https://ollama.com), start it, and install an open-weight model:

```sh
ollama pull gemma3:1b
```

The app lists installed models. Smaller models may produce invalid or ineffective proposals; these are rejected or fail the measured restoration checks. Llama 3.1 8B and other installed models can be selected in the keeper’s settings. AI inference uses local computing resources and electricity; there is no API fee.

The hosted static edition offers WebLLM, running Gemma 4 E2B or Qwen 2.5 0.5B on WebGPU. Initial model downloads can be hundreds of MB or several GB. Browser support, available memory, download access, and cache persistence vary. A clearly labelled scripted lesson works on every exhibit without a model. It is **not** presented as AI.

## What actually runs

| Exhibit | Implementation | Success criterion |
|---|---|---|
| Radio | Synthetic AM signal, coherent demodulation, two-pole low-pass, interference, gain clipping | Desired-tone / residual power ≥14 dB; clipped samples <1% |
| Telegraph | Seeded noisy pulse envelope; threshold and run-length decoding; International Morse 1:3:7 timing | Exact message recovery |
| Modem | Continuous-phase binary FSK; quadrature energy detection; byte decoding; CRC-8 | Zero bit errors and valid CRC |

The AM metric measures fitted desired-tone energy relative to residual energy; it is not a calibrated RF receiver sensitivity measurement. Radio dial kHz are mapped into audio-rate carrier offsets. The 100 bit/s FSK modem is inspired by V.21’s two-tone signalling; it is not V.21-compliant. Telegraph decoding uses a synthetic envelope, not audio-source ASR. The workshop, messages, illustrations, and sounds are original fiction or generated procedurally. This is not physical hardware repair or an archival reconstruction.

## AI architecture and trust boundary

`measured state → model → bounded JSON proposal → user approval → simulation → measured result`

- Local Node bridge accepts same-origin loopback requests, constructs the prompt itself, and connects only to local Ollama.
- The model cannot execute shell commands, fetch arbitrary URLs, alter files, or supply the success score.
- Control names, finite ranges, duplicate actions, and source identifiers are validated. A syntactically valid proposal can still be wrong; the measured outcome remains authoritative.
- Sources identify the reference collection; source IDs alone do not verify every generated claim.
- Journals stay in browser storage. Exports include settings, before/after metrics, provider/model, latency, token counts when available, and an SHA-256 checksum. That checksum detects changes to the evidence payload; it is not external attestation.
- No analytics or data collection. Initial page assets, optional model/runtime downloads, source links, and external font delivery can use the internet. Local questions go only to loopback Ollama; browser questions are processed in WebLLM.

## Verify

```sh
npm test
npm run evaluate
npm run evaluate:ai  # local server and gemma3:1b must be running
npm run build
npm run preview
```

`evaluate` tests 60 deterministic reference repairs. It does not measure AI performance. `evaluate:ai` executes actual model inference on nine seeded cases and records failures as well as successes. The prompt includes engineering notes, so this is an integration check, not a held-out reasoning benchmark. Set `WORKSHOP_MODEL` to compare an installed model. Raw reports are in `evidence/`.

For offline use, build once, install the model, then run `npm run preview` and disconnect internet. Local simulation and Ollama do not require an internet connection. Hosted offline use requires successful app and model caching; the browser may evict caches. Google Fonts fall back to system fonts offline.

## Deployment

The GitHub Actions workflow tests, evaluates, builds, and publishes static `dist/` to GitHub Pages. Enable Pages with **GitHub Actions** as the source. The local Ollama bridge is not publicly deployed; use WebLLM on the public site. Never expose Ollama to the internet to make the hosted demo work.

## Submission materials

- [DEV article draft](docs/dev-submission.md)
- [Demo script](docs/demo-script.md)
- [Release checklist](docs/submission-checklist.md)
- [Engineering notes](docs/engineering.md)

DEV publication is pending the author’s DEV account and final review. No prize, user-study result, public rank, or contest acceptance is claimed.

## Attribution and licensing

Application and original visuals: MIT, copyright 2026 Arjit Ujjawal. Built with AI-assisted development. Uses Vite (MIT), WebLLM / MLC (Apache-2.0), and optional Ollama (MIT); model weights have separate terms. See the exact dependency lockfile. No third-party source code or media is copied into the exhibit engine. Reference facts: [MIT Signals and Systems](https://ocw.mit.edu/courses/6-003-signals-and-systems-fall-2011/), [ITU M.1677](https://www.itu.int/rec/R-REC-M.1677/en), [ITU V.21](https://www.itu.int/rec/T-REC-V.21/en), [Gemma](https://ai.google.dev/gemma/docs), [WebLLM](https://webllm.mlc.ai/docs/).

## Contest timeline

This repository was created during the challenge window. Deadline: **2026-11-01 12:29 IST / 2026-10-31 23:59 PDT**. Any changes after that deadline must be itemized here before submission review.

**Post-deadline changes:** none at initial release.
