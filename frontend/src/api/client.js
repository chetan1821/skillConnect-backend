import {
  INITIAL_CATEGORIES,
  INITIAL_PROVIDERS,
  INITIAL_USERS,
  INITIAL_DASHBOARD_STATS
} from '../data/mockData';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('skillconnect_token') || null;
    // Default to Live Backend if not explicitly set to mock
    this.useMock = localStorage.getItem('skillconnect_use_mock') === 'true';
    this.mockCategories = [...INITIAL_CATEGORIES];
    this.mockProviders = [...INITIAL_PROVIDERS];
    this.mockUsers = [...INITIAL_USERS];
    this.mockStats = { ...INITIAL_DASHBOARD_STATS };
    this.mockBookings = [
      {
        id: 1,
        customer_id: 201,
        provider_id: 1,
        category_id: 1,
        scheduled_date: '2026-10-30',
        time_slot: 'Morning (9 AM - 12 PM)',
        service_address: 'Flat 402, Sunshine Heights, Mumbai',
        service_note: 'Main MCB tripping repeatedly on heavy load',
        status: 'Accepted',
        total_amount: '$65.00',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        customer_name: 'Kavita Rao',
        customer_email: 'kavita.rao@gmail.com',
        customer_phone: '+91 98711 00223',
        provider_business_name: 'Apex Precision Electricals',
        provider_name: 'Vikram Sharma',
        provider_phone: '+91 98765 43210',
        category_name: 'Electrical Services'
      },
      {
        id: 2,
        customer_id: 202,
        provider_id: 1,
        category_id: 1,
        scheduled_date: '2026-10-31',
        time_slot: 'Afternoon (12 PM - 4 PM)',
        service_address: 'Villa 12, Palm Grove, Bandra',
        service_note: 'New EV home charger point installation',
        status: 'Pending',
        total_amount: '$120.00',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        customer_name: 'Aditya Roy',
        customer_email: 'aditya.roy@outlook.com',
        customer_phone: '+91 99882 11223',
        provider_business_name: 'Apex Precision Electricals',
        provider_name: 'Vikram Sharma',
        provider_phone: '+91 98765 43210',
        category_name: 'Electrical Services'
      }
    ];
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('skillconnect_token', token);
    } else {
      localStorage.removeItem('skillconnect_token');
    }
  }

  setMockMode(enabled) {
    this.useMock = enabled;
    localStorage.setItem('skillconnect_use_mock', enabled ? 'true' : 'false');
  }

  async checkBackendHealth() {
    try {
      const res = await fetch(`${BASE_URL}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000)
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

    if (this.useMock) {
      return null;
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: AbortSignal.timeout(6000)
      });

      if (response.status === 401) {
        // Clear invalid or expired credentials
        this.setToken(null);
        localStorage.removeItem('skillconnect_user');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn(`[API] Backend request to ${endpoint} failed, utilizing local fallback:`, err.message);
      throw err;
    }
  }

  // Auth APIs
  async login(email, password) {
    if (!this.useMock) {
      try {
        const data = await this.request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        this.setToken(data.access_token);
        const me = await this.getMe();
        return { token: data.access_token, user: me };
      } catch (err) {
        console.warn("Backend login failed or unavailable:", err.message);
        if (err.message.includes("Invalid") || err.message.includes("inactive")) {
          throw err;
        }
      }
    }

    // Mock Fallback Login
    const user = this.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error("Invalid email or password");
    }
    if (!user.is_active) {
      throw new Error("User account is inactive");
    }
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    this.setToken(token);
    return { token, user };
  }

  async register(userData) {
    if (!this.useMock) {
      try {
        const created = await this.request('/auth/register', {
          method: 'POST',
          body: JSON.stringify(userData)
        });
        return created;
      } catch (err) {
        console.warn("Backend register failed or unavailable:", err.message);
        if (err.message.includes("already registered")) {
          throw err;
        }
      }
    }

    // Mock Fallback Register
    const existing = this.mockUsers.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      throw new Error("Email already registered");
    }

    const newUser = {
      id: Date.now(),
      full_name: userData.full_name,
      email: userData.email,
      phone_number: userData.phone_number,
      role: "Customer",
      is_active: true,
      created_at: new Date().toISOString()
    };
    this.mockUsers.unshift(newUser);
    this.mockStats.total_users += 1;
    this.mockStats.total_customers += 1;
    this.mockStats.active_users += 1;
    return newUser;
  }

  async getMe() {
    if (!this.useMock && this.token) {
      try {
        return await this.request('/auth/me');
      } catch {
        // Fallback
      }
    }
    return this.mockUsers[0];
  }

  // Admin APIs
  async getDashboardStats() {
    if (!this.useMock && this.token) {
      try {
        return await this.request('/admin/dashboard');
      } catch {
        // Fallback
      }
    }
    return {
      total_users: this.mockUsers.length,
      total_customers: this.mockUsers.filter(u => u.role === 'Customer').length,
      total_providers: this.mockUsers.filter(u => u.role === 'Provider').length,
      active_users: this.mockUsers.filter(u => u.is_active).length,
      inactive_users: this.mockUsers.filter(u => !u.is_active).length,
    };
  }

  async getUsers(params = {}) {
    if (!this.useMock && this.token) {
      try {
        const query = new URLSearchParams(params).toString();
        return await this.request(`/admin/users?${query}`);
      } catch {
        // Fallback
      }
    }

    let filtered = [...this.mockUsers];
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(u =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone_number.includes(q)
      );
    }
    if (params.role) {
      filtered = filtered.filter(u => u.role === params.role);
    }
    if (params.is_active !== undefined && params.is_active !== null && params.is_active !== '') {
      filtered = filtered.filter(u => u.is_active === (params.is_active === true || params.is_active === 'true'));
    }

    return {
      total: filtered.length,
      page: params.page || 1,
      limit: params.limit || 10,
      users: filtered
    };
  }

  async toggleUserStatus(userId, isActive) {
    if (!this.useMock && this.token) {
      try {
        return await this.request(`/admin/users/${userId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ is_active: isActive })
        });
      } catch {
        // Fallback
      }
    }

    const idx = this.mockUsers.findIndex(u => u.id === userId);
    if (idx !== -1) {
      this.mockUsers[idx].is_active = isActive;
      return this.mockUsers[idx];
    }
    throw new Error("User not found");
  }

  // Category APIs
  async getCategories(includeInactive = false) {
    if (!this.useMock) {
      try {
        if (includeInactive && this.token) {
          const res = await this.request('/admin/categories?include_inactive=true');
          if (res && res.length > 0) return res;
        } else {
          const res = await this.request('/public/categories');
          if (res && res.length > 0) return res;
        }
      } catch (err) {
        console.warn("Using fallback categories:", err.message);
      }
    }
    return includeInactive ? this.mockCategories : this.mockCategories.filter(c => c.is_active);
  }

  async createCategory(categoryData) {
    if (!this.useMock && this.token) {
      try {
        return await this.request('/admin/categories', {
          method: 'POST',
          body: JSON.stringify(categoryData)
        });
      } catch {
        // Fallback
      }
    }

    const newCat = {
      id: Date.now(),
      name: categoryData.name,
      description: categoryData.description || '',
      icon: 'Tag',
      provider_count: 0,
      is_active: true
    };
    this.mockCategories.push(newCat);
    return newCat;
  }

  async updateCategory(categoryId, categoryData) {
    if (!this.useMock && this.token) {
      try {
        return await this.request(`/admin/categories/${categoryId}`, {
          method: 'PATCH',
          body: JSON.stringify(categoryData)
        });
      } catch {
        // Fallback
      }
    }

    const idx = this.mockCategories.findIndex(c => c.id === categoryId);
    if (idx !== -1) {
      this.mockCategories[idx] = { ...this.mockCategories[idx], ...categoryData };
      return this.mockCategories[idx];
    }
    throw new Error("Category not found");
  }

  async deleteCategory(categoryId) {
    if (!this.useMock && this.token) {
      try {
        return await this.request(`/admin/categories/${categoryId}`, {
          method: 'DELETE'
        });
      } catch {
        // Fallback
      }
    }

    const idx = this.mockCategories.findIndex(c => c.id === categoryId);
    if (idx !== -1) {
      this.mockCategories[idx].is_active = false;
      return this.mockCategories[idx];
    }
    throw new Error("Category not found");
  }

  // Provider APIs
  async getProviders(includeInactive = false) {
    if (!this.useMock) {
      try {
        if (includeInactive && this.token) {
          const res = await this.request('/admin/providers?include_inactive=true');
          if (res && res.length > 0) return res;
        } else {
          const res = await this.request('/public/providers');
          if (res && res.length > 0) return res;
        }
      } catch (err) {
        console.warn("Using fallback providers:", err.message);
      }
    }
    return includeInactive ? this.mockProviders : this.mockProviders.filter(p => p.is_active);
  }

  async toggleProviderVerification(providerId, isVerified) {
    if (!this.useMock && this.token) {
      try {
        return await this.request(`/admin/providers/${providerId}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_verified: isVerified })
        });
      } catch {
        // Fallback
      }
    }

    const idx = this.mockProviders.findIndex(p => p.id === providerId);
    if (idx !== -1) {
      this.mockProviders[idx].is_verified = isVerified;
      return this.mockProviders[idx];
    }
    return null;
  }

  // =============================================================
  // SERVICE BOOKING ENGINE APIS
  // =============================================================
  async createBooking(bookingData) {
    if (!this.useMock && this.token) {
      try {
        return await this.request('/bookings', {
          method: 'POST',
          body: JSON.stringify(bookingData)
        });
      } catch (err) {
        console.warn("Backend createBooking failed, using local fallback:", err.message);
      }
    }

    // Mock Booking Creation
    const provider = this.mockProviders.find(p => p.id === bookingData.provider_id);
    const newBooking = {
      id: Date.now(),
      customer_id: 201,
      provider_id: bookingData.provider_id,
      category_id: bookingData.category_id || 1,
      scheduled_date: bookingData.scheduled_date,
      time_slot: bookingData.time_slot,
      service_address: bookingData.service_address,
      service_note: bookingData.service_note || '',
      status: 'Pending',
      total_amount: bookingData.total_amount || '$50.00',
      created_at: new Date().toISOString(),
      customer_name: 'Customer User',
      customer_email: 'customer@skillconnect.com',
      customer_phone: '+91 98765 00000',
      provider_business_name: provider ? provider.business_name : 'Expert Provider',
      provider_name: provider ? provider.full_name : 'Technician',
      provider_phone: provider ? provider.phone_number : '',
      category_name: provider?.categories?.[0] || 'General Service'
    };

    this.mockBookings.unshift(newBooking);
    return newBooking;
  }

  async getMyBookings() {
    if (!this.useMock && this.token) {
      try {
        const res = await this.request('/bookings/my');
        if (res) return res;
      } catch (err) {
        console.warn("Backend getMyBookings failed, using local fallback:", err.message);
      }
    }
    return this.mockBookings;
  }

  async getProviderBookings() {
    if (!this.useMock && this.token) {
      try {
        const res = await this.request('/bookings/provider');
        if (res) return res;
      } catch (err) {
        console.warn("Backend getProviderBookings failed, using local fallback:", err.message);
      }
    }
    return this.mockBookings;
  }

  async updateBookingStatus(bookingId, status) {
    if (!this.useMock && this.token) {
      try {
        return await this.request(`/bookings/${bookingId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        });
      } catch (err) {
        console.warn("Backend updateBookingStatus failed, using local fallback:", err.message);
      }
    }

    const idx = this.mockBookings.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      this.mockBookings[idx].status = status;
      return this.mockBookings[idx];
    }
    throw new Error("Booking not found");
  }

  async cancelBooking(bookingId) {
    if (!this.useMock && this.token) {
      try {
        return await this.request(`/bookings/${bookingId}/cancel`, {
          method: 'PATCH'
        });
      } catch (err) {
        console.warn("Backend cancelBooking failed, using local fallback:", err.message);
      }
    }

    const idx = this.mockBookings.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      this.mockBookings[idx].status = 'Cancelled';
      return this.mockBookings[idx];
    }
    throw new Error("Booking not found");
  }
}

export const api = new ApiClient();
