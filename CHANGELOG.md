# Changelog

All notable changes to dotmage-web (admin panel) are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Users page: team members and pending invitations (team-mode servers); shows a friendly notice on solo-mode servers.
- Audit log now shows which user performed each action.
- Header shows who you are (name + role + device) instead of a hardcoded "admin".
- Browser tab and header show the server's advertised name (`DOTMAGE_SERVER_NAME`) so
  multiple team panels are distinguishable at a glance.
- Docker images are multi-arch: `linux/amd64` + `linux/arm64` (Raspberry Pi, ARM VPS).

### Changed
- Docker images (`:latest` + `:vX.Y.Z`) publish only from an annotated release tag —
  pushing to main no longer moves `:latest`.

### Fixed

### Security

## 2026-07-06

### Added
- Header shows the current user (name + role + device) instead of a hardcoded "admin".
- Browser tab and header show the server's advertised name so multiple team panels are
  distinguishable at a glance.

## 2026-07-01

### Added
- Command sidebar with contextual quick commands.

### Fixed
- Clipboard copy works across browsers.

## 2026-06-11

### Added
- Folder grouping in the apps table + folder-aware breadcrumbs.
- Auto-refreshing tokens, enrollment-based login.

## 2026-06-09

Initial release: login, apps, devices, audit log; Ledger design; separate Docker image.
