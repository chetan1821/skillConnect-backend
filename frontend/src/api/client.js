const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('skillconnect_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('skillconnect_token', token);
    } else {
      localStorage.removeItem('skillconnect_token');
    }
  }

  async checkBackendHealth() {
    try {
      const res = await fetch(`${BASE_URL}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(12000)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: options.signal || AbortSignal.timeout(30000)
      });

      if (response.status === 401) {
        this.setToken(null);
        localStorage.removeItem('skillconnect_user');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error(`[API Error] ${endpoint}:`, err.message);
      throw err;
    }
  }

  // Auth APIs
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.access_token);
    const me = await this.getMe();
    return { token: data.access_token, user: me };
  }

  async register(userData) {
    return await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getMe() {
    if (!this.token) return null;
    return await this.request('/auth/me');
  }

  // Admin APIs
  async getDashboardStats() {
    return await this.request('/admin/dashboard');
  }

  async getUsers(params = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    return await this.request(`/admin/users${query ? `?${query}` : ''}`);
  }

  async toggleUserStatus(userId, isActive) {
    return await this.request(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive })
    });
  }

  async getUserProfile(userId) {
    return await this.request(`/admin/users/${userId}`);
  }

  // Category APIs
  async getCategories(includeInactive = false) {
    try {
      if (includeInactive && this.token) {
        const res = await this.request('/admin/categories?include_inactive=true');
        return res || [];
      } else {
        const res = await this.request('/public/categories');
        return res || [];
      }
    } catch {
      return [];
    }
  }

  async createCategory(categoryData) {
    return await this.request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async updateCategory(categoryId, categoryData) {
    return await this.request(`/admin/categories/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(categoryData)
    });
  }

  async deleteCategory(categoryId) {
    return await this.request(`/admin/categories/${categoryId}`, {
      method: 'DELETE'
    });
  }

  // Provider APIs
  async getProviders(includeInactive = false) {
    try {
      if (includeInactive && this.token) {
        const res = await this.request('/admin/providers?include_inactive=true');
        return res || [];
      } else {
        const res = await this.request('/public/providers');
        return res || [];
      }
    } catch {
      return [];
    }
  }

  async toggleProviderVerification(providerId, isVerified) {
    return await this.request(`/admin/providers/${providerId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_verified: isVerified })
    });
  }

  async createProvider(providerData) {
    return await this.request('/admin/providers/onboard', {
      method: 'POST',
      body: JSON.stringify(providerData)
    });
  }

  // Service Booking Engine APIs
  async createBooking(bookingData) {
    return await this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  async getMyBookings() {
    try {
      const res = await this.request('/bookings/my');
      return res || [];
    } catch {
      return [];
    }
  }

  async getProviderBookings() {
    try {
      const res = await this.request('/bookings/provider');
      return res || [];
    } catch {
      return [];
    }
  }

  async updateBookingStatus(bookingId, status) {
    return await this.request(`/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async cancelBooking(bookingId) {
    return await this.request(`/bookings/${bookingId}/cancel`, {
      method: 'PATCH'
    });
  }

  // OTP Verification & Job Workflow
  async startBookingJob(bookingId, startOtp) {
    return await this.request(`/bookings/${bookingId}/start`, {
      method: 'POST',
      body: JSON.stringify({ start_otp: startOtp })
    });
  }

  async completeBookingJob(bookingId, completionOtp) {
    return await this.request(`/bookings/${bookingId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ completion_otp: completionOtp })
    });
  }

  // Extra Quotes & Scope Expansion
  async submitExtraQuote(bookingId, quoteData) {
    return await this.request(`/bookings/${bookingId}/extra-quotes`, {
      method: 'POST',
      body: JSON.stringify(quoteData)
    });
  }

  async resolveExtraQuote(quoteId, action) {
    return await this.request(`/bookings/extra-quotes/${quoteId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action })
    });
  }

  // Provider Wallet & Earnings
  async getProviderWallet() {
    return await this.request('/bookings/provider/wallet');
  }

  async requestWalletWithdrawal(amount, bankAccountNote) {
    return await this.request('/bookings/provider/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, bank_account_note: bankAccountNote })
    });
  }

  // Admin Bookings & Disputes
  async getAdminBookings({ status, search } = {}) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString();
    return await this.request(`/admin/bookings${query ? `?${query}` : ''}`);
  }

  async updateAdminBookingStatus(bookingId, status) {
    return await this.request(`/admin/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // Admin Financial & Analytics
  async getAdminAnalytics() {
    return await this.request('/admin/analytics');
  }

  // Admin Audit Logs
  async getAdminAuditLogs(limit = 50) {
    return await this.request(`/admin/audit-logs?limit=${limit}`);
  }

  // Announcement & Global Notice
  async getAdminAnnouncement() {
    return await this.request('/admin/announcement');
  }

  async updateAdminAnnouncement(data) {
    return await this.request('/admin/announcement', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getPublicAnnouncement() {
    try {
      return await this.request('/public/announcement');
    } catch {
      return { is_active: false };
    }
  }

  // Multi-Category Management for Providers
  async getProviderCategoriesDetail(providerId) {
    return await this.request(`/admin/providers/${providerId}/categories/manage`);
  }

  async assignCategoryToProvider(providerId, categoryId) {
    return await this.request(`/admin/providers/${providerId}/categories`, {
      method: 'POST',
      body: JSON.stringify({ category_id: categoryId })
    });
  }

  async removeCategoryFromProvider(providerId, categoryId) {
    return await this.request(`/admin/providers/${providerId}/categories/${categoryId}`, {
      method: 'DELETE'
    });
  }
}

export const api = new ApiClient();
