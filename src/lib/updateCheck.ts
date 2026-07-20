import { majorOf, semverGt } from './semver';

// The server ships from the dotMage/server repo, tagged vX.Y.Z (see
// server/.github/workflows/docker.yml — `on: push: tags: ['v*']`).
// GitHub serves these endpoints with `Access-Control-Allow-Origin: *` for
// anonymous requests, so the browser can read them directly — the server never
// phones home, mirroring how the CLI checks from the user's machine.
//
// stable → `/releases/latest` (excludes prereleases). dev → list releases and
// pick the newest by semver, prereleases included (mirrors `dmage --channel dev`).
const LATEST_URL = 'https://api.github.com/repos/dotMage/server/releases/latest';
const LIST_URL = 'https://api.github.com/repos/dotMage/server/releases?per_page=30';
const RELEASES_PAGE = 'https://github.com/dotMage/server/releases';
const CACHE_KEY = 'dotmage:update_check';
const CHANNEL_KEY = 'dotmage:channel';
const TTL_MS = 24 * 60 * 60 * 1000; // 24h — mirrors the CLI's update_check.json

export type Channel = 'stable' | 'dev';

export function getChannel(): Channel {
  try {
    return localStorage.getItem(CHANNEL_KEY) === 'dev' ? 'dev' : 'stable';
  } catch {
    return 'stable';
  }
}

export function setChannel(channel: Channel): void {
  try {
    localStorage.setItem(CHANNEL_KEY, channel);
    localStorage.removeItem(CACHE_KEY); // force a fresh check on the new channel
  } catch {
    /* best-effort */
  }
}

interface Cache {
  checkedAt: number;
  channel: Channel;
  latest: string | null; // normalized (no leading `v`); null = nothing usable
  htmlUrl: string | null;
}

export interface UpdateInfo {
  latest: string; //  e.g. "2.1.0"
  htmlUrl: string; // release page
  major: boolean; //  latest major > current major -> the `:2` pin won't auto-pull it
}

function readCache(): Cache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Cache;
    return typeof c.checkedAt === 'number' ? c : null;
  } catch {
    return null;
  }
}

function writeCache(c: Cache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    /* private mode / quota — the cache is best-effort */
  }
}

interface GhRelease {
  tag_name?: string;
  html_url?: string;
  draft?: boolean;
  prerelease?: boolean;
}

async function fetchLatest(channel: Channel): Promise<Cache> {
  const url = channel === 'dev' ? LIST_URL : LATEST_URL;
  const resp = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!resp.ok) throw new Error(`GitHub ${resp.status}`);
  const body = await resp.json();

  let picked: GhRelease | null = null;
  if (channel === 'dev') {
    // Newest by semver across all non-draft releases (prereleases included).
    for (const r of (body as GhRelease[]).filter((r) => !r.draft)) {
      const v = r.tag_name?.replace(/^v/, '');
      if (!v) continue;
      if (!picked || semverGt(v, picked.tag_name!.replace(/^v/, ''))) picked = r;
    }
  } else {
    picked = body as GhRelease;
  }

  return {
    checkedAt: Date.now(),
    channel,
    latest: picked?.tag_name ? picked.tag_name.replace(/^v/, '') : null,
    htmlUrl: picked?.html_url ?? null,
  };
}

/**
 * Compare the running server version against the latest release on the active
 * channel. Returns the newer release, or null if up to date or on any error
 * (offline, rate-limit, bad JSON) — best-effort, never surfaces failures.
 */
export async function checkForUpdate(current: string): Promise<UpdateInfo | null> {
  const channel = getChannel();
  let cache = readCache();
  const fresh = cache && cache.channel === channel && Date.now() - cache.checkedAt < TTL_MS;
  if (!fresh) {
    try {
      cache = await fetchLatest(channel);
      writeCache(cache);
    } catch {
      // fall back to a stale cache on the same channel if we have one
      if (!cache || cache.channel !== channel) return null;
    }
  }
  if (!cache || !cache.latest || !semverGt(cache.latest, current)) return null;
  return {
    latest: cache.latest,
    htmlUrl: cache.htmlUrl ?? RELEASES_PAGE,
    major: majorOf(cache.latest) > majorOf(current),
  };
}
