// Semver comparison, prerelease-aware. Ported from the CLI's `semver_gt`
// (dotmage-cli/dmage/src/cmd/upgrade.rs) so the admin banner and `dmage upgrade`
// order versions identically. Per semver §11:
//   2.2.0 > 2.2.0-dev.3 > 2.2.0-dev.2 > 2.1.0

type Core = [number, number, number];

function parse(s: string): { core: Core; pre: string | null } {
  const dash = s.indexOf('-');
  const coreStr = dash === -1 ? s : s.slice(0, dash);
  const pre = dash === -1 ? null : s.slice(dash + 1);
  const nums = coreStr.split('.').map((p) => {
    const n = parseInt(p, 10);
    return Number.isNaN(n) ? 0 : n;
  });
  return { core: [nums[0] ?? 0, nums[1] ?? 0, nums[2] ?? 0], pre };
}

// -1 | 0 | 1
function compareCore(a: Core, b: Core): number {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
  }
  return 0;
}

// Semver §11 prerelease ordering: dot-separated identifiers; numeric compared
// numerically and lower than alphanumeric; more identifiers wins a tie.
function prereleaseGt(a: string, b: string): boolean {
  const ia = a.split('.');
  const ib = b.split('.');
  const len = Math.max(ia.length, ib.length);
  for (let i = 0; i < len; i++) {
    const x = ia[i];
    const y = ib[i];
    if (x === undefined) return false; // fewer identifiers -> smaller
    if (y === undefined) return true; //  more identifiers -> larger
    const nx = /^\d+$/.test(x) ? Number(x) : null;
    const ny = /^\d+$/.test(y) ? Number(y) : null;
    let ord: number;
    if (nx !== null && ny !== null) ord = nx === ny ? 0 : nx > ny ? 1 : -1;
    else if (nx !== null) ord = -1; // numeric < alphanumeric
    else if (ny !== null) ord = 1;
    else ord = x === y ? 0 : x > y ? 1 : -1;
    if (ord !== 0) return ord > 0;
  }
  return false;
}

/** True if version `a` is strictly newer than `b`. */
export function semverGt(a: string, b: string): boolean {
  const pa = parse(a);
  const pb = parse(b);
  const c = compareCore(pa.core, pb.core);
  if (c !== 0) return c > 0;
  if (pa.pre === null && pb.pre === null) return false;
  if (pa.pre === null) return true; //  release > its prereleases
  if (pb.pre === null) return false; // prerelease < the release
  return prereleaseGt(pa.pre, pb.pre);
}

/** Major component of a version string (0 on parse failure). */
export function majorOf(v: string): number {
  return parse(v).core[0];
}
