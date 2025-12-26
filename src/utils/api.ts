const API_BASE_URL = 'https://node.pravraha.com';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export interface BlogFilters {
  page?: number;
  limit?: number;
  isPublished?: boolean;
  category?: string;
  tags?: string;
  author?: string;
  search?: string;
}

export interface Author {
  name: string;
  avatar: string;
  bio?: string;
}

export interface Blog {
  _id: string;
  title: string;
  metaDescription: string;
  slug: string;
  excerpt: string;
  image: string;
  category: string;
  author: Author;
  date: string;
  content: string;
  tags: string[];
  ctaTitle?: string;
  ctaLink?: string;
  ctaDesc?: string;
  ctaButtonTitle?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogFormData {
  title: string;
  metaDescription: string;
  slug: string;
  excerpt: string;
  image: string;
  category: string;
  author: Author;
  date: string;
  content: string;
  tags: string[];
  ctaTitle?: string;
  ctaLink?: string;
  ctaDesc?: string;
  ctaButtonTitle?: string;
  isPublished: boolean;
}

export const blogAPI = {
  async getAll(filters: BlogFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE_URL}/admin/blogs?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch blogs');
    }

    return response.json();
  },

  async getById(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/blogs/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch blog');
    }

    return response.json();
  },

  async create(data: BlogFormData) {
    const response = await fetch(`${API_BASE_URL}/admin/blogs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create blog');
    }

    return result;
  },

  async update(id: string, data: Partial<BlogFormData>) {
    const response = await fetch(`${API_BASE_URL}/admin/blogs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update blog');
    }

    return result;
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/blogs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete blog');
    }

    return response.json();
  },

  async togglePublish(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/blogs/${id}/publish`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to toggle publish status');
    }

    return result;
  },
};
