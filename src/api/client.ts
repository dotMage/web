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
  action: string;
  app_name: string | null;
  env_name: string | null;
  rev_number: number | null;
  at: string;
}

export class DotMageClient {
  private token: string;
  private baseUrl: string;

  constructor(token: string, baseUrl = BASE) {
    this.token = token;
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const resp = await fetch(`${this.baseUrl}/api/v1${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`HTTP ${resp.status}: ${text}`);
    }
    return resp.json();
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
}
