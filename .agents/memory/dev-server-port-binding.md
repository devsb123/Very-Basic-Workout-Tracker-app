---
name: Dev server port binding
description: Why backend dev servers must bind 0.0.0.0 for Replit workflow port detection
---

A workflow configured with `waitForPort` only detects the port as open when the
process binds to `0.0.0.0` (all interfaces). Binding to `127.0.0.1`/`localhost`
makes the server reachable locally but the workflow reports "expected port did
not open" and fails to start.

**Why:** Replit's port probe checks the external/container interface, not the
loopback interface.

**How to apply:** Bind any server that a workflow tracks (frontend or backend)
to `0.0.0.0`. A Vite dev proxy targeting `http://localhost:<port>` still reaches
a backend bound to `0.0.0.0`, so this does not break local proxying.
