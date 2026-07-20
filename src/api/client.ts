const BASE = '';

export interface AppInfo {
  id: string;
  name: string;
  environments: EnvInfo[];
  created_at: string;
  updated_at: string;
}

export interface EnvInfo {
  id: string;
  name: string;
  latest_rev: number;
  protected: boolean;
  created_at: string;
  updated_at: string;
}

export interface RevisionMeta {
  rev_number: number;
  content_hash: string | null;
  created_at: string;
  device_id: string;
  rollback_of: number | null;
}

export interface DeviceInfo {
  id: string;
  name: string;
  last_seen: string | null;
  expires_at: string;
  revoked: boolean;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  device_id: string | null;
  user: string | null;
  action: string;
  app_name: string | null;
  env_name: string | null;
  rev_number: number | null;
  at: string;
}

export interface UserInfo {
  id: string;
  name: string;
  role: string;
  status: string;
  key_gen: number;
  created_at: string;
}

export interface InvitationInfo {
  id: string;
  name: string;
  role: string;
  status: string;
  expires_at: string;
}

export interface UsersResponse {
  users: UserInfo[];
  invitations: InvitationInfo[];
}

export interface HealthInfo {
  status: string;
  version: string;
  account_exists: boolean;
  features: string[];
  server_name?: string;
  web_port?: number;
  web_url?: string;
}

export interface EnrollToken {
  token: string;
  expires_at: string;
}

export interface WhoamiInfo {
  user_id: string | null;
  name: string;
  role: string;
  device_id: string;
  device_name: string;
}

const REFRESH_KEY = 'dotmage_refresh_token';
const DEVICE_KEY = 'dotmage_device_token';

export class DotMageClient {
  private token: string;
  private baseUrl: string;
  private onTokenRefresh?: (dt: string, rt: string) => void;
  private onAuthFailure?: () => void;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(
    token: string,
    baseUrl = BASE,
    onTokenRefresh?: (dt: string, rt: string) => void,
    onAuthFailure?: () => void,
  ) {
    this.token = token;
    this.baseUrl = baseUrl;
    this.onTokenRefresh = onTokenRefresh;
    this.onAuthFailure = onAuthFailure;
  }

  private doFetch(path: string, options?: RequestInit) {
    return fetch(`${this.baseUrl}/api/v1${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    let resp = await this.doFetch(path, options);

    // Auto-refresh on 401
    if (resp.status === 401) {
      const ok = await this.tryRefresh();
      if (ok) {
        resp = await this.doFetch(path, options);
      }
      if (resp.status === 401) {
        this.onAuthFailure?.();
        throw new Error('Session expired');
      }
    }

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`HTTP ${resp.status}: ${text}`);
    }
    return resp.json();
  }

  private async tryRefresh(): Promise<boolean> {
    // Deduplicate concurrent refresh calls
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = this._doRefresh();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async _doRefresh(): Promise<boolean> {
    const rt = localStorage.getItem(REFRESH_KEY);
    if (!rt) return false;
    try {
      const resp = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt }),
      });
      if (!resp.ok) return false;
      const data = await resp.json();
      this.token = data.device_token;
      localStorage.setItem(DEVICE_KEY, data.device_token);
      localStorage.setItem(REFRESH_KEY, data.refresh_token);
      this.onTokenRefresh?.(data.device_token, data.refresh_token);
      return true;
    } catch {
      return false;
    }
  }

  async getApps(): Promise<AppInfo[]> {
    const data = await this.request<{ apps: AppInfo[] }>('/apps');
    return data.apps;
  }

  async getEnvs(appName: string): Promise<EnvInfo[]> {
    const data = await this.request<{ environments: EnvInfo[] }>(
      `/apps/${encodeURIComponent(appName)}/envs`,
    );
    return data.environments;
  }

  async getRevisions(appName: string, envName: string): Promise<RevisionMeta[]> {
    const data = await this.request<{ revisions: RevisionMeta[] }>(
      `/apps/${encodeURIComponent(appName)}/envs/${encodeURIComponent(envName)}/revisions`,
    );
    return data.revisions;
  }

  async getDevices(): Promise<DeviceInfo[]> {
    const data = await this.request<{ devices: DeviceInfo[] }>('/devices');
    return data.devices;
  }

  async revokeDevice(deviceId: string): Promise<void> {
    await this.request(`/devices/${encodeURIComponent(deviceId)}`, {
      method: 'DELETE',
    });
  }

  async getAudit(filters?: { app?: string; env?: string; limit?: number }): Promise<AuditEvent[]> {
    const params = new URLSearchParams();
    if (filters?.app) params.set('app', filters.app);
    if (filters?.env) params.set('env', filters.env);
    if (filters?.limit) params.set('limit', String(filters.limit));
    const qs = params.toString();
    const path = `/audit${qs ? `?${qs}` : ''}`;
    const data = await this.request<{ events: AuditEvent[] }>(path);
    return data.events;
  }

  /** Server capabilities + advertised name (public, no auth needed). */
  async getHealth(): Promise<HealthInfo> {
    const resp = await fetch(`${this.baseUrl}/health`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
  }

  /** Identity of the current device/user (B.9). */
  async getWhoami(): Promise<WhoamiInfo> {
    return this.request<WhoamiInfo>('/whoami');
  }

  /** Returns null when the server runs in solo mode (endpoint 404s). */
  async getUsers(): Promise<UsersResponse | null> {
    try {
      return await this.request<UsersResponse>('/users');
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('HTTP 404')) return null;
      throw e;
    }
  }

  /** Change a team member's role (owner only). */
  async changeUserRole(userId: string, role: string): Promise<void> {
    await this.request(`/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  /** Remove a team member — drops their key wraps and revokes their devices (owner only). */
  async removeUser(userId: string): Promise<void> {
    await this.request(`/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
  }

  /**
   * Mint a one-time enrollment token for adding a device / web login.
   * No AK involved — the new device unlocks its own key with the master password.
   * `kind`: "enrollment" (CLI `dmage auth --enroll`) or "web-admin" (browser login).
   */
  async createEnrollToken(name: string, ttl: string, kind = 'enrollment'): Promise<EnrollToken> {
    return this.request<EnrollToken>('/devices/enroll-token', {
      method: 'POST',
      body: JSON.stringify({ name, ttl, kind }),
    });
  }
}
