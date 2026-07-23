---
name: notarize-mac
description: >-
  Build and verify a signed, notarized macOS app or DMG using the project's
  existing notarization automation. Use when the user asks to notarize a Mac
  build, produce a release DMG, or verify Gatekeeper.
---

# Notarize macOS Build

Use the project's existing notarization automation. Don't invent a new signing
pipeline or expose credentials.

## Procedure

1. Confirm the checkout and branch. Default to a clean, current default branch.
2. Locate the existing notarization/release script (e.g. a
   `notarize-*-installer.sh` or the release script the project already ships):
   - use a path the user supplies first;
   - otherwise search the repo and nearby release/notary checkouts;
   - if none exists, ask for its location instead of recreating it.
3. Run the script from the environment it expects.
4. Preserve its signing identity, App Store Connect key handling, artifact
   naming, and notarization flow.
5. Verify the resulting artifact with the script's checks or `spctl`.
6. Report the artifact path, size, notarization result, and Gatekeeper result.

Never print private key contents, signing credentials, or secret values.
