---
title: "The Last Workshop: an open AI can suggest a repair. The signal has to prove it."
published: false
tags: devchallenge, hf26challenge, gemma, opensource
---

*This is a draft submission for [Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26). Author review and demo recording are still required.*

## What I Built

An old radio can survive on a shelf long after anyone remembers how to tune it. The object remains; the knowledge becomes the ghost.

The Last Workshop is a playable museum of that missing knowledge. You restore a radio, decode a telegraph message, and reconnect a small modem. An open-weight model is your keeper: it reads instrument measurements and proposes a repair. You approve it. The simulation runs again and decides whether the signal actually recovered.

The setting is fictional. The signals, decoding, and measurements run in code. There are no authentic archival voices being impersonated and no generated historical anecdotes presented as facts.

## Demo

[Open the workshop](https://arjitujjawal-art.github.io/the-last-workshop/)

**Before publication: add the recorded demonstration URL.** The hosted edition offers browser inference; the local edition connects to Ollama. A labelled scripted lesson lets visitors explore without downloading a model.

## Code

[The Last Workshop on GitHub](https://github.com/arjitujjawal-art/the-last-workshop)

## How I Built It

The radio generates amplitude modulation, mixes it with a local oscillator, filters it, and measures desired-tone energy and clipping. The telegraph recovers characters from pulse timing. The modem compares the energy at two frequencies, recovers bytes, and verifies a CRC-8 packet checksum.

The AI cannot type an arbitrary command or mark a case successful. It returns a small JSON proposal containing control names, numeric values, an explanation, and reference IDs. The application validates it, asks the visitor to apply it, and records the measured result.

Gemma through local Ollama and Gemma 4 through WebLLM provide open-weight inference paths. Different devices and models behave differently. Small models can return a structurally valid but ineffective repair; a reference ID does not make a factual claim true. These are limitations the interface and evaluation preserve.

The repository includes real local inference reports, deterministic regression cases, and rejected proposals. **Before publication: insert the final measured AI results from `evidence/ai-evaluation.json`, with the exact model and protocol.** The 60 deterministic reference cases are engine tests, not an AI success rate. The model receives engineering notes, so the inference trial is an integration check, not a held-out reasoning benchmark.

## Why Does Open Innovation Matter?

A museum should outlive a subscription. With a local open model, the exhibit’s questions and answers can remain on the visitor’s machine. Educators can inspect the signal generator, change an experiment, replace the keeper, or keep a copy when a hosted service disappears.

The application uses a permissive license, and the models retain their own licenses. Local production use requires installing dependencies and model weights first. Browser use requires WebGPU and a completed model download. I do not describe an uncached hosted page as an offline application.

## The Spirit of It

The recovery moment is small: static becomes a chord, pulses become a sentence, two tones become readable bytes. The project honors the past by making its mechanisms understandable again.

**Before publication: replace this note with an actual visitor observation, if collected with permission. Do not invent feedback.**

## Prize Categories

- **Best Use of Gemma:** the open-weight keeper reads the current instrument state and proposes bounded adjustments. Include a successful, authentic Gemma trace and demonstration in the final post.
- **Best Use of GitHub Copilot:** the category description includes GitHub Actions automation. This project uses Actions to test, evaluate, build, and deploy the workshop. Development was AI-assisted; do not claim Copilot coding-agent use unless it actually occurred.

## Attribution

Built by Arjit Ujjawal with AI-assisted development. Original app and procedural visuals: MIT. Signal references: MIT Signals and Systems, ITU M.1677, and V.21. Runtime: Vite, WebLLM, and Ollama. Historical references are linked in the source archive. Models have separate licenses.
