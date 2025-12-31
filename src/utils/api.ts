const API_BASE_URL = 'https://node.pravraha.com';
// const API_BASE_URL = 'http://localhost:3000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const getAuthHeadersForFormData = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Helper function to get full image URL from relative path
 * If the image is already a full URL, return it as is
 * Otherwise, prepend the backend URL
 */
export const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) return '';
  
  // If it's already a full URL (starts with http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Otherwise, prepend the backend URL
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${API_BASE_URL}/${cleanPath}`;
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
  image?: string | File; // Can be a URL string or File object for upload
  category: string;
  author: Author;
  date: string;
  content: string;
  tags: string[];
  ctaTitle?: string;
  ctaLink?: string;
  ctaDesc?: string;
  ctaButtonTitle?: string;
   seoScripts: string[],
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
    const formData = new FormData();
    
    // Required fields (always sent)
    formData.append('title', data.title);
    formData.append('slug', data.slug);
    formData.append('isPublished', String(data.isPublished));
    
    // Optional fields for drafts, required for publishing
    // Send them if they have values (backend will validate based on isPublished)
    if (data.metaDescription) formData.append('metaDescription', data.metaDescription);
    if (data.excerpt) formData.append('excerpt', data.excerpt);
    if (data.category) formData.append('category', data.category);
    if (data.date) formData.append('date', data.date);
    if (data.content) formData.append('content', data.content);
    
    // Author - send as JSON string if it exists and has a name
    // Backend expects: { name, bio?, avatar? }
    if (data.author && data.author.name) {
      formData.append('author', JSON.stringify({
        name: data.author.name,
        bio: data.author.bio || undefined,
        avatar: data.author.avatar || undefined,
      }));
    }
    
    // Tags - always send as JSON array (can be empty array)
    // Backend expects: Array of strings
    formData.append('tags', JSON.stringify(data.tags || []));

    formData.append('seoScripts',JSON.stringify(data.seoScripts||[]));
    
    // Handle image - only append if it's a File
    // The backend multer expects field name "blogImage"
    if (data.image instanceof File) {
      formData.append('blogImage', data.image);
    }
    
    // Optional CTA fields
    if (data.ctaTitle) formData.append('ctaTitle', data.ctaTitle);
    if (data.ctaLink) formData.append('ctaLink', data.ctaLink);
    if (data.ctaDesc) formData.append('ctaDesc', data.ctaDesc);
    if (data.ctaButtonTitle) formData.append('ctaButtonTitle', data.ctaButtonTitle);

    const response = await fetch(`${API_BASE_URL}/admin/blogs`, {
      method: 'POST',
      headers: getAuthHeadersForFormData(),
      body: formData,
    });

    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    let result;
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      // If not JSON, get text to see the error
      const text = await response.text();
      throw new Error(`Server error: ${response.status} ${response.statusText}. ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create blog');
    }

    return result;
  },

  async update(id: string, data: Partial<BlogFormData>) {
    const formData = new FormData();
    
    // Append only provided fields to FormData
    // Backend expects these fields if provided
    if (data.title !== undefined) formData.append('title', data.title);
    if (data.metaDescription !== undefined) formData.append('metaDescription', data.metaDescription);
    if (data.slug !== undefined) formData.append('slug', data.slug);
    if (data.excerpt !== undefined) formData.append('excerpt', data.excerpt);
    if (data.category !== undefined) formData.append('category', data.category);
    if (data.date !== undefined) formData.append('date', data.date);
    if (data.content !== undefined) formData.append('content', data.content);
    if (data.isPublished !== undefined) formData.append('isPublished', String(data.isPublished));
    
    // Author - send as JSON string if provided
    // Backend expects: { name, bio?, avatar? } or can be object
    if (data.author !== undefined) {
      formData.append('author', JSON.stringify({
        name: data.author.name || '',
        bio: data.author.bio || undefined,
        avatar: data.author.avatar || undefined,
      }));
    }
    
    // Tags - send as JSON array if provided (can be empty array to clear tags)
    // Backend expects: Array of strings
    if (data.tags !== undefined) {
      formData.append('tags', JSON.stringify(Array.isArray(data.tags) ? data.tags : []));
    }
    if (data.seoScripts !== undefined) {
      formData.append('seoScripts', JSON.stringify(Array.isArray(data.seoScripts) ? data.seoScripts : []));
    }
    
    // Handle image - only append if it's a File (new upload)
    // The backend multer expects field name "blogImage"
    // If it's a string, don't send it (backend will keep existing image)
    if (data.image instanceof File) {
      formData.append('blogImage', data.image);
    }
    
    // Optional CTA fields
    if (data.ctaTitle !== undefined) formData.append('ctaTitle', data.ctaTitle);
    if (data.ctaLink !== undefined) formData.append('ctaLink', data.ctaLink);
    if (data.ctaDesc !== undefined) formData.append('ctaDesc', data.ctaDesc);
    if (data.ctaButtonTitle !== undefined) formData.append('ctaButtonTitle', data.ctaButtonTitle);

    const response = await fetch(`${API_BASE_URL}/admin/blogs/${id}`, {
      method: 'PUT',
      headers: getAuthHeadersForFormData(),
      body: formData,
    });

    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    let result;
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      // If not JSON, get text to see the error
      const text = await response.text();
      throw new Error(`Server error: ${response.status} ${response.statusText}. ${text.substring(0, 100)}`);
    }

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
