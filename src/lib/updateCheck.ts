import { majorOf, semverGt } from './semver';

// The server ships from the dotMage/server repo, tagged vX.Y.Z (see
// server/.github/workflows/docker.yml — `on: push: tags: ['v*']`).
// `/releases/latest` excludes prereleases; the admin only tracks stable.
// GitHub serves this endpoint with `Access-Control-Allow-Origin: *` for
// anonymous requests, so the browser can read it directly — the server never
// phones home, mirroring how the CLI checks from the user's machine.
const RELEASES_URL = 'https://api.github.com/repos/dotMage/server/releases/latest';
const RELEASES_PAGE = 'https://github.com/dotMage/server/releases';
const CACHE_KEY = 'dotmage:update_check';
const TTL_MS = 24 * 60 * 60 * 1000; // 24h — mirrors the CLI's update_check.json

interface Cache {
  checkedAt: number;
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

async function fetchLatest(): Promise<Cache> {
  const resp = await fetch(RELEASES_URL, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!resp.ok) throw new Error(`GitHub ${resp.status}`);
  const data = (await resp.json()) as { tag_name?: string; html_url?: string };
  return {
    checkedAt: Date.now(),
    latest: data.tag_name ? data.tag_name.replace(/^v/, '') : null,
    htmlUrl: data.html_url ?? null,
  };
}

/**
 * Compare the running server version against the latest stable GitHub release.
 * Returns the newer release, or null if up to date or on any error (offline,
 * rate-limit, bad JSON) — the banner is best-effort and never surfaces failures.
 */
export async function checkForUpdate(current: string): Promise<UpdateInfo | null> {
  let cache = readCache();
  const fresh = cache && Date.now() - cache.checkedAt < TTL_MS;
  if (!fresh) {
    try {
      cache = await fetchLatest();
      writeCache(cache);
    } catch {
      // fall back to a stale cache if we have one, else give up quietly
      if (!cache) return null;
    }
  }
  if (!cache || !cache.latest || !semverGt(cache.latest, current)) return null;
  return {
    latest: cache.latest,
    htmlUrl: cache.htmlUrl ?? RELEASES_PAGE,
    major: majorOf(cache.latest) > majorOf(current),
  };
}
