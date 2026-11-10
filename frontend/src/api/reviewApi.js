import api from './client';

export const reviewApi = {
  analyzeCode: async (payload) => {
    let headers = {};
    let data = payload;

    // If uploading via FormData (file upload)
    if (payload instanceof FormData) {
      headers = { 'Content-Type': 'multipart/form-data' };
    }

    const res = await api.post('/reviews/analyze', data, { headers });
    return res.data;
  },

  getReviews: async (params = {}) => {
    const res = await api.get('/reviews', { params });
    return res.data;
  },

  getReviewById: async (id) => {
    const res = await api.get(`/reviews/${id}`);
    return res.data;
  },

  deleteReview: async (id) => {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  },

  getStats: async () => {
    const res = await api.get('/reviews/stats');
    return res.data;
  },

  getHealth: async () => {
    const res = await api.get('/health');
    return res.data;
  },
};
