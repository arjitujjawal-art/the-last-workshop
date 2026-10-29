# Engineering decisions

The engine is independent of the UI and model runtime. Seeded pseudo-random noise makes every case replayable. The AI receives public measurements, not expected message text. The transmission parameters are accessible through a simulated scan, so the task is interpreting measurements and selecting a bounded repair; it is not blind RF estimation.

Radio synthesizes a 2400 Hz carrier with 110/220/330 Hz modulation and a 1050 Hz interfering offset. A dial offset maps to an audio-rate local oscillator. Two first-order low-pass stages follow synchronous mixing. Wanted-tone energy is estimated by sine/cosine projection over the output window. Clipping is counted before saturation. No claim of physical RF fidelity is made.

Telegraph synthesizes 1:3:7 Morse timing, variable dot length, and seeded envelope noise. A threshold creates runs; run durations classify dots, dashes, letter and word gaps. Character edit distance is measured against the original transmitter message.

Modem uses continuous-phase FSK at 980/1180 Hz, a 100 bit/s clock, and seeded additive noise. The receiver compares quadrature energies in each bit window. The original payload plus CRC-8 is packed MSB-first. No V.21 interoperability, framing, synchronization recovery, or telephone-channel emulation is claimed.

The keeper is an assistant with a constrained action surface. It proposes at most three numeric control changes. Validation rejects undefined actions, duplicate controls, non-finite/out-of-range values, and unknown citation IDs. It does not judge prose correctness or semantic quality. A valid proposal is tested by recomputing the simulation.

The small-model evaluation is intentionally diagnostic. Engineering notes are present in the prompt and seeds are variations of the implemented tasks. Results show integration reliability, not new capability or broad reasoning. A stronger next experiment would withhold fault types and compare model-only advice with the measured feedback loop, including unsuccessful attempts and latency.
