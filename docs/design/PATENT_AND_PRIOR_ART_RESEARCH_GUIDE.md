# Patent And Prior Art Research Guide

> Converted from the original SyncPlay design PDF for searchable, editable use in Antigravity. This conversion preserves extracted text and page boundaries; review diagrams/layout-dependent content against the source PDF if needed.

**Source file:** `media_sync_patent_research_guide.pdf`



---

## Source PDF page 1

Media Synchronization Patent & Prior-Art Research Guide
Page 1
Media Synchronization Patent & Prior-Art Research
Guide
Project goal: build a reusable, open-source, browser-first leaderless/server-minimized media-timeline
synchronization protocol + SDK. This guide maps the most useful patents and standards we identified to the
engineering problems they can teach us to solve.
Important scope: this is a technical research guide, not legal advice and not an exhaustive patent search. Patent
families have continuations and international counterparts; legal status should be checked in the relevant jurisdiction
before relying on any document.
Core conclusion: media synchronization itself is old and heavily explored. The engineering opportunity is to learn the
established techniques, then focus on a robust leaderless protocol: distributed state, deterministic event ordering,
conflict resolution, convergence, peer failure, partitions, faulty peers, and browser constraints.
1. Target Architecture
Each participant independently obtains the media. A bootstrap/signaling service may introduce peers, but after bootstrap
the synchronization state is maintained by peers rather than a permanent authoritative synchronization server.
Application -> MediaSync SDK -> distributed synchronization engine -> transport abstraction
(WebRTC/WebSocket/QUIC/etc.) -> local HTML5 audio/video timeline
Do not treat these as novel by themselves: clock synchronization, timestamps, RTT measurement, latency
compensation, playback drift correction, group playback, P2P communication, participant weighting, and future
execution timestamps all have substantial prior art.
2. Patent-by-Patent Study Guide
US20050286546A1 - Synchronized media streaming between distributed peers
What it does: 2004 priority. P2P synchronized media, heterogeneous channel delays, common logical clock, delay
compensation and playback correction.
What to learn: Learn peer discovery; source/receiver timing; network-delay equalization; logical clocks; continuous drift
correction; buffering. Use it as the foundational timing baseline, but note its source/receiver model.
Primary record: https://patents.google.com/patent/US20050286546A1/en
US20130067116A1 / US8930577B2 - Synchronizing Streaming Video between Viewers
over a Network
What it does: Microsoft family. Host-based synchronization plus a disclosed host-optional/P2P variant where clients can
communicate with one another and perform the same computations.
What to learn: Study FIRST for our architecture: peer-to-peer state exchange; host election/optional host; timecode
estimation; full vs fast synchronization; catch-up behavior. Then ask what is missing for deterministic leaderless
convergence.
Primary record: https://patents.google.com/patent/US20130067116A1/en
WO2009083797A2 / US20090106357A1 / US8595342B2 - Synchronized media playback
using autonomous clients over standard Internet protocols
What it does: Autonomous clients independently obtain content while a synchronization service provides synchronization
information.
What to learn: Learn separation of content delivery from synchronization; client autonomy; sync-service design. Useful
for SDK abstraction, but synchronization remains centralized.
Primary record: https://patents.google.com/patent/WO2009083797A2/en


---

## Source PDF page 2

Media Synchronization Patent & Prior-Art Research Guide
Page 2
US20150095512A1 - Network-Synchronized Media Playback
What it does: Common system clock, future Effective Time for commands, clock-drift detection and frame-level
correction.
What to learn: Learn future-dated command execution; synchronized clocks; drift thresholds; PTS/frame timing;
corrective frame skip/repeat. Translate to browser APIs such as currentTime and playbackRate.
Primary record: https://patents.google.com/patent/US20150095512A1/en
US8973063B2 - Method and system for synchronization of digital media playback
What it does: Dynamic time-based synchronization, clock skew/drift compensation, playback-rate/sample-rate
adjustment, resilience to temporary network unavailability.
What to learn: Learn clock alignment; synchronization under network uncertainty; recovery after connectivity loss;
playback-rate correction. Excellent source for reconnect/offline edge cases.
Primary record: https://patents.google.com/patent/US8973063B2/en
US20110218656A1 - Social media playback
What it does: Group playback where participants can control playback; reference-clock synchronization and
resynchronization after drift.
What to learn: Learn group-control semantics, playback-alteration commands, clock resynchronization triggers, and
user-driven control. Useful for race-condition requirements.
Primary record: https://patents.google.com/patent/US20110218656A1/en
US10382511B2 / US20170251040A1 - Synchronizing playback of digital media content
What it does: Synchronizes digital devices using timing information and can use media/audio fingerprinting or
watermarking when timing must be recovered.
What to learn: Learn robust re-alignment when timestamps/network timing are unreliable; content-derived
synchronization as a recovery mechanism; device/decoder delay handling.
Primary record: https://patents.google.com/patent/US10382511B2/en
US20140010515A1 - Playback synchronization
What it does: Repeated sender timestamps estimate clock offsets; minimum clock-offset selection is used to improve
synchronization.
What to learn: Learn offset estimation from repeated samples and why low-delay samples can reduce asymmetric-delay
error. Compare with RTT filtering and robust estimators.
Primary record: https://patents.google.com/patent/US20140010515A1/en
US9094564B2 - Clock synchronization for shared media playback
What it does: Master/slave clock synchronization using packet timestamps and offset correction; discusses clock drift in
shared media playback.
What to learn: Learn clock-offset estimation and low-delay sample selection. Treat master/slave architecture as a
baseline we ultimately want to remove.
Primary record: https://patents.google.com/patent/US9094564B2
US10712771B2 - System and method for synchronized playback of streaming digital
content
What it does: Each content player synchronizes local time to a time reference maintained by a time server; playback
actions coordinate against local clocks.
What to learn: Learn centralized time-reference architecture and scheduled playback commands. Use it as the 'what we
want to eliminate' baseline.
Primary record: https://patents.google.com/patent/US10712771B2/en


---

## Source PDF page 3

Media Synchronization Patent & Prior-Art Research Guide
Page 3
US20210289255A1 - Synchronization of media content across multiple participant
devices
What it does: Participants independently stream content; a coordination server computes synchronized playback.
Includes participant playback information and weighting concepts.
What to learn: Study participant-state aggregation, buffer/playback-position inputs, weighting and coordination-server
design. Weighting itself is not new; investigate robust decentralized estimators instead.
Primary record: https://patents.google.com/patent/US20210289255A1/en
US9338208B2 / WO2014078818 - Common event-based multidevice media playback
What it does: Event-based synchronization; devices report timing/event information and synchronization mechanisms
account for clock phase/frequency differences.
What to learn: Study event timing, clock phase/frequency estimation, acknowledgements and correction. Useful for
event-driven protocol design.
Primary record: https://patents.google.com/patent/US9338208B2/en
WO2017178371A1 - Slave requested audio synchronization
What it does: Master/slave synchronization where the slave requests synchronization; discusses clock-offset variation,
network quality, master replacement and adaptive request frequency.
What to learn: Study adaptive synchronization frequency, network-quality feedback, master replacement and offset
monitoring. Then ask how to replace master election with leaderless consensus.
Primary record: https://patents.google.com/patent/WO2017178371A1/en
US9286382B2 / US20140094944A1 - Simultaneous playback of audio tracks from
multiple devices
What it does: Uses a synchronization/pilot signal and master/slave relationships to align playback.
What to learn: Study media-derived synchronization and signal-based timing recovery as a fallback when network
timestamps are unreliable.
Primary record: https://patents.google.com/patent/US20140094944A1/en
US12120376B2 - Latency negotiation in a heterogeneous network of synchronized
speakers
What it does: Synchronization across heterogeneous network technologies and differing latency/processing paths.
What to learn: Study heterogeneous-latency modeling. Do not assume equal RTT, codec, device, or network
characteristics.
Primary record: https://patents.google.com/patent/US12120376B2
US10264070B2 - System and method for synchronizing media presentation at multiple
recipients
What it does: Host-controlled synchronized media distribution, NTP-based clock setup, periodic synchronization and
clock stretching/compression.
What to learn: Study periodic resynchronization, clock stretch/compress techniques and retransmission. Treat host
control as a baseline to remove.
Primary record: https://patents.google.com/patent/US10264070B2/en
US20190045471A1 - Synchronization of Content Between Networked Devices
What it does: Presentation timestamps, latency compensation and ongoing drift updates; synchronization packets can
adjust playback rate.
What to learn: Study unidirectional synchronization and drift updates. Use as a minimal protocol baseline before adding
bidirectional/leaderless behavior.
Primary record: https://patents.google.com/patent/US20190045471A1/en


---

## Source PDF page 4

Media Synchronization Patent & Prior-Art Research Guide
Page 4
US20200162784A1 - Synchronizing internet video streams for simultaneous feedback
What it does: OTT streams synchronized using server time/UTC and client clock checks; addresses clock skew and
playback reference position.
What to learn: Study OTT-specific clock skew and CDN/live-stream considerations.
Primary record: https://patents.google.com/patent/US20200162784A1/en


---

## Source PDF page 5

Media Synchronization Patent & Prior-Art Research Guide
Page 5
3. Standards and Non-Patent Foundations
RFC 7272 - Inter-Destination Media Synchronization (IDMS) Using RTCP. This is a real standardized protocol
mechanism. It defines exchange of media arrival/presentation information and RTCP IDMS reporting/settings. The RFC
explicitly leaves the synchronization algorithm outside the specification. This is useful for understanding the wire-protocol
layer, but it is not the complete leaderless browser SDK we are targeting.
Learn: RTP timestamps, RTCP Sender Reports, NTP timestamps, synchronization contexts, IDMS reports/settings,
media playout timing, and the distinction between wire protocol and synchronization algorithm.
RFC: https://www.rfc-editor.org/rfc/rfc7272.html
WebRTC: study RTCDataChannel, signaling, ICE/STUN/TURN, connection lifecycle, NAT traversal and failure modes.
Treat WebRTC as a peer-communication substrate, not the synchronization algorithm.
Browser media timing: study HTMLMediaElement.currentTime, playbackRate, play/pause/seek events, buffering, timer
throttling, background tabs, decoder/rendering delay and frame-accuracy limitations.
4. Engineering Problems: What to Learn and Reuse
Problem
Study
Takeaway
Peer identification /
bootstrap
US20050286546, US8930577, WebRTC/ICE
Peer discovery, room membership, identity, signaling, NAT traversal,
reconnect and membership changes. Bootstrap server should be
minimal.
Clock offset estimation
US20050286546, US20150095512,
US20140010515, US9094564
NTP-style exchanges, RTT, asymmetric delay, offset estimation,
low-delay sample selection and clock drift.
Latency compensation
US20050286546, US20150095512,
US20190045471
Future execution time, estimated network delay, buffering and target
presentation time.
Playback drift
US20150095512, US8973063,
US20190045471, US10382511
Hard correction vs soft correction, thresholds, hysteresis and
recovery.
Clock frequency drift
US9338208, US8973063, US9094564
Phase offset versus frequency error. A clock can be aligned now and
still diverge later.
Group state aggregation
US20210289255, US20140096169,
US8930577
Participant positions, aggregation and weighting. Then investigate
robust decentralized estimators.
Event ordering / races
US20110218656, US8930577,
common-event synchronization literature
Scheduled operations, acknowledgements and deterministic state
transitions. Our harder version: simultaneous PLAY/PAUSE/SEEK
without an authority.
Faults / disconnection
US8973063, WO2017178371
Recovery, master replacement and adaptive resync. Our harder
version: no master, peer loss, partition and merge.
Media-derived recovery
US10382511, US9286382
Fingerprints, watermarks and pilot signals when network timing
becomes unreliable.
Heterogeneous
devices/networks
US12120376
Device processing, transport and network latency differences.
5. Our Research Frontier
Do not make the project merely 'P2P watch party'. Make it a generic distributed media timeline synchronization layer.
Each application supplies a media timeline; the SDK maintains convergence.
Candidate state: peer ID, media identity, logical revision, operation ID, operation timestamp, estimated
group time, local media time, playback rate, play/pause state, clock offset estimate, RTT/jitter
statistics, confidence score, buffer state and protocol capabilities.
Hard edge cases to attack: simultaneous commands; late joiners; peer disappearance; temporary network partitions;
partition merge; stale messages; duplicated/reordered messages; asymmetric latency; unstable clocks;
background-tab throttling; mobile sleep/wake; buffering; different media durations; different playback rates; faulty
peers; malicious peers; insufficient quorum; and convergence after recovery.
Core research question: how can every honest peer independently compute the same playback state from imperfect
observations without a permanent leader or authoritative synchronization server?


---

## Source PDF page 6

Media Synchronization Patent & Prior-Art Research Guide
Page 6
6. Suggested Build Roadmap
1. Reproduce baselines - Implement centralized sync, then leader-based P2P. Measure offset, RTT, drift and
convergence.
2. Transport layer - WebRTC DataChannel first; keep sync engine transport-agnostic. Bootstrap service only for
discovery/authentication/signaling.
3. Clock engine - NTP-style offset estimation, RTT/jitter tracking, clock frequency estimation and confidence scoring.
4. Timeline engine - Model position(t) = basePosition + playbackRate * elapsedGroupTime.
5. Event engine - Immutable operations for PLAY/PAUSE/SEEK/RATE with deterministic IDs/revisions; handle
duplicate, delayed and reordered operations.
6. Leaderless state - Remove the leader. Every peer computes group state from the same observation set. Start simple,
then test robust estimators.
7. Failure model - Inject crashes, delayed messages, loss, asymmetric RTT, partitions, clock faults and malicious values.
Measure convergence.
8. Browser reality - Test background throttling, buffering, decoder latency, playbackRate limits, tab suspension and
device differences.
9. SDK - Expose join/leave, play/pause/seek/rate, state events, transport adapters, diagnostics and
synchronization-quality metrics.
10. Specification - Document a wire protocol and transport adapters after implementation stabilizes; consider an
RFC-style specification later.
7. Recommended Reading Order
1. US8930577B2 / US20130067116A1 - closest conceptual starting point for host-optional/P2P synchronization.
2. US20050286546A1 - foundational P2P timing, delay and drift problems.
3. US20150095512A1 - future execution times and practical drift correction.
4. US8973063B2 - synchronization under network uncertainty and recovery.
5. US9338208B2 - event/clock phase-frequency synchronization.
6. US20210289255A1 - participant aggregation and weighting.
7. US10382511B2 - recovery when timestamps are insufficient.
8. RFC 7272 - standardized media synchronization wire semantics.
9. WebRTC + ICE/STUN/TURN - peer connectivity realities.
10. Browser media timing APIs - final execution layer.
8. Final Position
The patent landscape should guide the implementation rather than discourage it. Basic synchronization mechanisms are
old. The useful engineering opportunity is to make a developer-friendly open implementation and push the difficult part:
leaderless, server-minimized, convergent synchronization under real-world failures.
When studying a patent, distinguish: (1) abstract, (2) detailed description, (3) independent claims, (4) family/legal
status, and (5) whether a public implementation exists. A patent disclosure is not automatically a usable SDK.
Source basis: Google Patents records for the listed families and IETF RFC 7272. Verify current family status and legal relevance in official patent
databases before making legal decisions.
