// API Calls
const API = {
    getEngineers: async () => {
        const response = await axios.get('/api/engineers');
        return response.data;
    },

    getTickets: async (params) => {
        const query = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key]) query.append(key, params[key]);
        });

        // Add other params if needed
        const queryString = query.toString();
        const url = queryString ? `/api/tickets?${queryString}` : '/api/tickets';
        console.log('Fetching tickets from:', url);

        const response = await axios.get(url);
        return response.data;
    },

    getTicketDetail: async (id) => {
        const response = await axios.get(`/api/tickets/${id}`);
        return response.data;
    },

    createTicket: async (data) => {
        const response = await axios.post('/api/tickets', data);
        return response.data;
    },

    updateTicketStatus: async (id, status, changedBy) => {
        const response = await axios.patch(`/api/tickets/${id}/status`, {
            status,
            changed_by: changedBy
        });
        return response.data;
    },

    assignTicket: async (id, assignedTo, changedBy) => {
        const response = await axios.patch(`/api/tickets/${id}/assign`, {
            assigned_to: assignedTo,
            changed_by: changedBy
        });
        return response.data;
    },

    updateTicket: async (id, data) => {
        const response = await axios.put(`/api/tickets/${id}`, data);
        return response.data;
    },

    deleteTicket: async (id) => {
        const response = await axios.delete(`/api/tickets/${id}`);
        return response.data;
    },

    getDashboardStats: async () => {
        const response = await axios.get('/api/dashboard/stats');
        return response.data;
    },

    changePassword: async (oldPassword, newPassword) => {
        const response = await axios.put('/api/auth/password', {
            oldPassword,
            newPassword
        });
        return response.data;
    }
};

export default API;
