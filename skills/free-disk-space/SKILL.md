---
name: free-disk-space
description: >-
  Safely reclaim disk space on macOS without touching personal or agent data.
  Use when the user asks to free disk space, clear caches, or investigate a
  nearly full Mac.
---

# Free Disk Space

Investigate first. Delete only regenerable data the user has authorized.

## Safety

- Never inspect, delete, or modify the data of the IDE or agent you're running
  inside — its application-support dir, caches, `globalStorage`, databases,
  extensions, or logs — unless the user explicitly names it as a cleanup target.
  On macOS that lives under `~/Library/Application Support/<app>/` (e.g.
  `.../Cursor/`).
- Never delete browser history, extensions, cookies, credentials, local
  storage, IndexedDB, bookmarks, passwords, or user-created files.
- Ask before destructive cleanup such as deleting Docker images, containers,
  volumes, or virtual disks.

## Workflow

1. Record current usage from the macOS data volume:

   ```bash
   df -h /System/Volumes/Data
   ```

2. Find the largest consumers before deleting anything. Use `du`, package
   manager diagnostics, and application-specific storage commands. Do not
   descend into protected agent/IDE data.
3. Explain what is large, whether it is regenerable, and the expected impact.
4. Clean only safe targets:
   - contents of `~/Library/Caches/`
   - unused package-manager cache entries, such as `pnpm store prune`
   - known browser model/GPU caches, never browser profile data
5. For sparse files such as Docker's virtual disk, report actual disk use from
   `du`, not apparent size from `ls`.
6. Record usage again and report space freed.

Do not represent the sealed `/` system volume as the Mac's usable data-volume
capacity.
