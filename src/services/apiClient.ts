/** Optional REST client for the FarmVeda FastAPI backend. Local Dexie remains the default. */
const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') as string | undefined;
const TOKEN_KEY = 'farmveda_api_access_token';
const REFRESH_KEY = 'farmveda_api_refresh_token';

export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: unknown) { super(message); }
}

function authToken() { return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY); }
function refreshToken() { return sessionStorage.getItem(REFRESH_KEY) || localStorage.getItem(REFRESH_KEY); }
function remembered() { return Boolean(localStorage.getItem(REFRESH_KEY)); }

export const apiClient = {
  get configured() { return Boolean(baseUrl); },
  setAccessToken(token: string, refreshToken?: string, remember = false) {
    const store = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    store.setItem(TOKEN_KEY, token);
    other.removeItem(TOKEN_KEY);
    if (refreshToken) store.setItem(REFRESH_KEY, refreshToken);
    other.removeItem(REFRESH_KEY);
  },
  clearAccessToken() { sessionStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(REFRESH_KEY); localStorage.removeItem(REFRESH_KEY); },
  async restoreSession() {
    if (!authToken() && !refreshToken()) return undefined;
    try {
      return await this.request<{id:string;full_name:string;email:string;preferred_language?:'en'|'hi'|'kn'}>('/auth/me');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        this.clearAccessToken();
        return undefined;
      }
      throw error;
    }
  },
  async request<T>(path: string, init: RequestInit = {}, signal?: AbortSignal, retryAfterRefresh = true): Promise<T> {
    if (!baseUrl) throw new ApiError('Backend API is not configured. Set VITE_API_BASE_URL.', 0);
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');
    if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`, { ...init, headers, signal });
    } catch (error) {
      if (signal?.aborted) throw error;
      window.dispatchEvent(new CustomEvent('farmveda:api-error', { detail: 'Cannot reach the FarmVeda backend. Check that it is running and try again.' }));
      throw new ApiError('Cannot reach the FarmVeda backend. Check that it is running and try again.', 0);
    }
    if (response.status === 401 && retryAfterRefresh) {
      const savedRefreshToken = refreshToken();
      if (savedRefreshToken) {
        try {
          const refreshResponse = await fetch(`${baseUrl}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ refresh_token: savedRefreshToken }),
            signal,
          });
          if (refreshResponse.ok) {
            const refreshed = await refreshResponse.json() as { access_token: string; refresh_token: string };
            this.setAccessToken(refreshed.access_token, refreshed.refresh_token, remembered());
            return this.request<T>(path, init, signal, false);
          }
          this.clearAccessToken();
        } catch {
          this.clearAccessToken();
        }
      }
    }
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const message = typeof body?.detail === 'string' ? body.detail
        : response.status === 403 ? 'You do not have permission to perform this action.'
        : response.status === 422 ? 'Some submitted information is invalid. Check the fields and try again.'
        : response.status >= 500 ? 'The backend encountered an error. Please try again shortly.'
        : `The backend request failed (${response.status}).`;
      if (response.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/register')) {
        this.clearAccessToken();
        window.dispatchEvent(new Event('farmveda:unauthorized'));
      }
      window.dispatchEvent(new CustomEvent('farmveda:api-error', { detail: message }));
      throw new ApiError(message, response.status, body);
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  },
  async login(email: string, password: string, remember = false, signal?: AbortSignal) {
    const result = await this.request<{access_token:string;refresh_token:string;user:unknown}>('/auth/login', { method:'POST', body:JSON.stringify({email,password}) }, signal);
    this.setAccessToken(result.access_token, result.refresh_token, remember);
    return result;
  },
  async register(input: {full_name:string;email:string;mobile_number?:string;password:string;preferred_language?:string}, signal?: AbortSignal) {
    const result = await this.request<{access_token:string;refresh_token:string;user:unknown}>('/auth/register', { method:'POST', body:JSON.stringify(input) }, signal);
    this.setAccessToken(result.access_token, result.refresh_token, true);
    return result;
  },
  async logout() {
    try {
      if (authToken()) await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearAccessToken();
    }
  },
};
