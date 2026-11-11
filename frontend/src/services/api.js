const API_BASE_URL = '/api';

/**
 * Helper to get the JWT token from localStorage
 */
const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Universal fetch wrapper handling headers, errors, and JSON parsing
 */
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do not set Content-Type if sending FormData (browser automatically sets boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    // If unauthorized, token expired
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    throw new Error(errorMsg);
  }

  return data;
};

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => request('/auth/me'),

  // Designers (Admin)
  getDesigners: () => request('/users/designers'),
  createDesigner: (designerData) =>
    request('/users/designers', {
      method: 'POST',
      body: JSON.stringify(designerData),
    }),
  updateDesigner: (id, updates) =>
    request(`/users/designers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteDesigner: (id) =>
    request(`/users/designers/${id}`, {
      method: 'DELETE',
    }),

  // Projects
  getProjects: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/projects${query ? `?${query}` : ''}`);
  },
  getProjectById: (id) => request(`/projects/${id}`),
  createProject: (formData) =>
    request('/projects', {
      method: 'POST',
      body: formData,
    }),
  updateProject: (id, formData) =>
    request(`/projects/${id}`, {
      method: 'PUT',
      body: formData,
    }),
  toggleBidding: (id, biddingStatus) =>
    request(`/projects/${id}/bidding`, {
      method: 'PATCH',
      body: JSON.stringify({ biddingStatus }),
    }),
  deleteProject: (id) =>
    request(`/projects/${id}`, {
      method: 'DELETE',
    }),

  // Bids
  submitBid: (bidData) =>
    request('/bids', {
      method: 'POST',
      body: JSON.stringify(bidData),
    }),
  updateBid: (id, bidData) =>
    request(`/bids/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bidData),
    }),
  getMyBids: () => request('/bids/my-bids'),
  getProjectBids: (projectId) => request(`/bids/project/${projectId}`),
  getBidById: (id) => request(`/bids/${id}`),

  // Assignments
  awardProject: (awardData) =>
    request('/assignments/award', {
      method: 'POST',
      body: JSON.stringify(awardData),
    }),
  getAdminAssignments: (status) =>
    request(`/assignments/admin${status ? `?status=${status}` : ''}`),
  getDesignerAssignments: () => request('/assignments/my-assignments'),
  getAssignmentById: (id) => request(`/assignments/${id}`),
  cancelAssignment: (id, reason) =>
    request(`/assignments/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Submissions
  uploadSubmission: (assignmentId, formData) =>
    request(`/submissions/assignment/${assignmentId}`, {
      method: 'POST',
      body: formData,
    }),
  getSubmissions: (assignmentId) =>
    request(`/submissions/assignment/${assignmentId}`),
  reviewSubmission: (submissionId, decision, adminFeedback) =>
    request(`/submissions/${submissionId}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, adminFeedback }),
    }),

  // File download helper
  getFileUrl: (type, filename) => {
    const token = getToken();
    return `${API_BASE_URL}/files/${type}/${encodeURIComponent(filename)}${
      token ? `?token=${encodeURIComponent(token)}` : ''
    }`;
  },
};
