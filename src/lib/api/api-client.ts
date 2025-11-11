
import { ScanResult, ScanConfig } from "../scanner/scan-engine";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Schedule {
    frequency: "daily" | "weekly" | "monthly" | "custom";
    cron?: string;
    timezone?: string;
}

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: "owner" | "admin" | "member" | "viewer";
}

export interface Team {
    id: string;
    name: string;
    members: TeamMember[];
}

export interface UserProfile {
    name: string;
    email: string;
}

export interface PasswordChange {
    currentPassword: string;
    newPassword: string;
}

export interface AnalyticsData {
    totalScans: number;
    scansByDay: { date: string; count: number }[];
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
}

export class ApiClient {
  private static baseURL = API_BASE_URL;
  private static token: string | null = null;

  static setAuthToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  static getAuthToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem("auth_token");
    }
    return this.token;
  }

  static clearAuthToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || "Request failed",
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Authentication endpoints
  static async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  static async logout(): Promise<ApiResponse<void>> {
    this.clearAuthToken();
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  // Scan endpoints
  static async createScan(
    target: string,
    type: "url" | "api" | "file",
    config: ScanConfig
  ): Promise<ApiResponse<ScanResult>> {
    return this.request("/scans", {
      method: "POST",
      body: JSON.stringify({ target, type, config }),
    });
  }

  static async getScan(scanId: string): Promise<ApiResponse<ScanResult>> {
    return this.request(`/scans/${scanId}`);
  }

  static async getScans(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<ScanResult>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.type) queryParams.append("type", params.type);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);

    const query = queryParams.toString();
    return this.request(`/scans${query ? `?${query}` : ""}`);
  }

  static async deleteScan(scanId: string): Promise<ApiResponse<void>> {
    return this.request(`/scans/${scanId}`, {
      method: "DELETE",
    });
  }

  static async cancelScan(scanId: string): Promise<ApiResponse<void>> {
    return this.request(`/scans/${scanId}/cancel`, {
      method: "POST",
    });
  }

  // Scheduled scans
  static async createScheduledScan(
    target: string,
    type: "url" | "api" | "file",
    config: ScanConfig,
    schedule: Schedule
  ): Promise<ApiResponse<{ id: string; schedule: Schedule }>> {
    return this.request("/scans/scheduled", {
      method: "POST",
      body: JSON.stringify({ target, type, config, schedule }),
    });
  }

  static async getScheduledScans(): Promise<ApiResponse<Array<{ id: string; schedule: Schedule; scan: ScanResult }>>> {
    return this.request("/scans/scheduled");
  }

  static async deleteScheduledScan(scheduleId: string): Promise<ApiResponse<void>> {
    return this.request(`/scans/scheduled/${scheduleId}`, {
      method: "DELETE",
    });
  }

  // Webhooks
  static async createWebhook(url: string, events: string[]): Promise<ApiResponse<Webhook>> {
    return this.request("/webhooks", {
      method: "POST",
      body: JSON.stringify({ url, events }),
    });
  }

  static async getWebhooks(): Promise<ApiResponse<Webhook[]>> {
    return this.request("/webhooks");
  }

  static async deleteWebhook(webhookId: string): Promise<ApiResponse<void>> {
    return this.request(`/webhooks/${webhookId}`, {
      method: "DELETE",
    });
  }

  // Team collaboration
  static async getTeams(): Promise<ApiResponse<Team[]>> {
    return this.request("/teams");
  }

  static async createTeam(name: string): Promise<ApiResponse<{ id: string; name: string }>> {
    return this.request("/teams", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  static async shareScan(scanId: string, teamId: string): Promise<ApiResponse<void>> {
    return this.request(`/scans/${scanId}/share`, {
      method: "POST",
      body: JSON.stringify({ teamId }),
    });
  }

  // User profile
  static async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    return this.request("/user/profile");
  }

  static async updateUserProfile(profileData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.request("/user/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  static async changePassword(passwordData: PasswordChange): Promise<ApiResponse<void>> {
    return this.request("/user/password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
  }

  // Analytics
  static async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: "day" | "week" | "month";
  }): Promise<ApiResponse<AnalyticsData>> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.groupBy) queryParams.append("groupBy", params.groupBy);

    const query = queryParams.toString();
    return this.request(`/analytics${query ? `?${query}` : ""}`);
  }
}

// Fallback to localStorage if API is not available
export class LocalStorageApiClient {
  private static STORAGE_KEY = "scan_results";
  private static SCHEDULED_SCANS_KEY = "scheduled_scans";
  private static WEBHOOKS_KEY = "webhooks";

  static async getScans(): Promise<ScanResult[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  static async saveScan(scan: ScanResult): Promise<void> {
    const scans = await this.getScans();
    const index = scans.findIndex((s) => s.id === scan.id);
    if (index >= 0) {
      scans[index] = scan;
    } else {
      scans.push(scan);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scans));
  }

  static async deleteScan(scanId: string): Promise<void> {
    const scans = await this.getScans();
    const filtered = scans.filter((s) => s.id !== scanId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  static async getScheduledScans(): Promise<{ id: string; schedule: Schedule; scan: ScanResult }[]> {
    const data = localStorage.getItem(this.SCHEDULED_SCANS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static async saveScheduledScan(schedule: { id: string; schedule: Schedule; scan: ScanResult }): Promise<void> {
    const schedules = await this.getScheduledScans();
    const index = schedules.findIndex((s) => s.id === schedule.id);
    if (index >= 0) {
      schedules[index] = schedule;
    } else {
      schedules.push(schedule);
    }
    localStorage.setItem(this.SCHEDULED_SCANS_KEY, JSON.stringify(schedules));
  }

  static async deleteScheduledScan(scheduleId: string): Promise<void> {
    const schedules = await this.getScheduledScans();
    const filtered = schedules.filter((s) => s.id !== scheduleId);
    localStorage.setItem(this.SCHEDULED_SCANS_KEY, JSON.stringify(filtered));
  }

  static async getWebhooks(): Promise<Webhook[]> {
    const data = localStorage.getItem(this.WEBHOOKS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static async saveWebhook(webhook: Webhook): Promise<void> {
    const webhooks = await this.getWebhooks();
    const index = webhooks.findIndex((w) => w.id === webhook.id);
    if (index >= 0) {
      webhooks[index] = webhook;
    } else {
      webhooks.push(webhook);
    }
    localStorage.setItem(this.WEBHOOKS_KEY, JSON.stringify(webhooks));
  }

  static async deleteWebhook(webhookId: string): Promise<void> {
    const webhooks = await this.getWebhooks();
    const filtered = webhooks.filter((w) => w.id !== webhookId);
    localStorage.setItem(this.WEBHOOKS_KEY, JSON.stringify(filtered));
  }
}
