import http from './http';

export const authAPI = {
    
    signup: async (data) => {
        const response = await http.post('/auth/signup', data);
        return response.data;
    },

    
    verifyMFA: async (data) => {
        const response = await http.post('/auth/verify-mfa', data);
        return response.data;
    },

    
    login: async (data) => {
        const response = await http.post('/auth/login', data);
        return response.data;
    },

    
    logout: async () => {
        const response = await http.post('/auth/logout');
        return response.data;
    },

    
    getCurrentUser: async () => {
        const response = await http.get('/auth/me');
        return response.data;
    },

    
    refreshToken: async () => {
        const response = await http.post('/auth/refresh');
        return response.data;
    },
};

export const userAPI = {
    
    getProfile: async () => {
        const response = await http.get('/user/profile');
        return response.data;
    },

    
    updateProfile: async (data) => {
        const response = await http.put('/user/profile', data);
        return response.data;
    },

    
    changePassword: async (data) => {
        const response = await http.post('/user/change-password', data);
        return response.data;
    },
};

export const hotelAPI = {
    
    getHotels: async (params) => {
        const response = await http.get('/hotels', { params });
        return response.data;
    },

    
    getHotel: async (id) => {
        const response = await http.get(`/hotels/${id}`);
        return response.data;
    },

    
    getRooms: async (hotelId, params) => {
        const response = await http.get(`/hotels/${hotelId}/rooms`, { params });
        return response.data;
    },

    
    getRoom: async (roomId) => {
        const response = await http.get(`/hotels/rooms/${roomId}`);
        return response.data;
    },
};

export const bookingAPI = {
    
    createBooking: async (data) => {
        const response = await http.post('/bookings', data);
        return response.data;
    },

    
    getBookings: async (params) => {
        const response = await http.get('/bookings', { params });
        return response.data;
    },

    
    getBooking: async (id) => {
        const response = await http.get(`/bookings/${id}`);
        return response.data;
    },

    
    cancelBooking: async (id, reason) => {
        const response = await http.post(`/bookings/${id}/cancel`, { cancellationReason: reason });
        return response.data;
    },
};

export const paymentAPI = {
    
    createPayment: async (data) => {
        const response = await http.post('/payments', data);
        return response.data;
    },

    
    getPayments: async () => {
        const response = await http.get('/payments');
        return response.data;
    },

    
    getPayment: async (id) => {
        const response = await http.get(`/payments/${id}`);
        return response.data;
    },
};

export const adminAPI = {
    
    createHotel: async (data) => {
        const response = await http.post('/admin/hotels', data);
        return response.data;
    },

    
    updateHotel: async (id, data) => {
        const response = await http.put(`/admin/hotels/${id}`, data);
        return response.data;
    },

    
    deleteHotel: async (id) => {
        const response = await http.delete(`/admin/hotels/${id}`);
        return response.data;
    },

    
    createRoom: async (data) => {
        const response = await http.post('/admin/rooms', data);
        return response.data;
    },

    
    updateRoom: async (id, data) => {
        const response = await http.put(`/admin/rooms/${id}`, data);
        return response.data;
    },

    
    deleteRoom: async (id) => {
        const response = await http.delete(`/admin/rooms/${id}`);
        return response.data;
    },

    
    getAllBookings: async (params) => {
        const response = await http.get('/admin/bookings', { params });
        return response.data;
    },

    
    getStats: async () => {
        const response = await http.get('/admin/stats');
        return response.data;
    },
};
