# Changelog

All notable changes to dotmage-web (admin panel) are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Auto-login for `dmage open`: the admin panel reads a one-time login token from the URL
  fragment (`#token=…`), signs you in, and strips it from the address bar immediately. A
  failed/expired link shows a friendly notice on the login page.
- Update banner: the admin panel checks the latest server release on GitHub and shows a
  dismissible banner with a copy-paste upgrade command when a newer version is out. The
  check runs in your browser (the server never phones home) and is cached for 24h. A new
  major shows a distinct "migration needed" variant, since the pinned major won't
  auto-update.

### Changed
- The login screen now shows the real app version instead of a hardcoded one.

### Fixed

### Security

## [2.0.0] - 2026-07-16

First tag-based release; the major aligns with the product version (CLI 2.x), the
installer pins `ghcr.io/dotmage/web:2`.

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
