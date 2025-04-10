import axios from 'axios';
import axiosRetry from 'axios-retry';

// Set the API base URL
const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Configure retry logic
axiosRetry(api, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
               error.code === 'ECONNABORTED' ||
               error.code === 'ERR_NETWORK';
    }
});

// Add request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('Making request to:', config.url);
        console.log('Request method:', config.method);
        console.log('Request headers:', config.headers);
        
        if (token) {
            console.log('Found token, adding to Authorization header');
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('No token found in localStorage');
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor
api.interceptors.response.use(
    (response) => {
        console.log('Response received from:', response.config.url);
        console.log('Response status:', response.status);
        return response;
    },
    (error) => {
        if (error.response) {
            console.error('Response error:', {
                url: error.config?.url,
                status: error.response.status,
                data: error.response.data,
                message: error.message
            });
        } else if (error.request) {
            console.error('Request error - no response received:', {
                url: error.config?.url,
                request: error.request
            });
        } else {
            console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },
    logout: async () => {
        try {
            const response = await api.post('/auth/logout');
            return response.data;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },
    getProfile: async () => {
        try {
            const response = await api.get('/auth/profile');
            return response.data;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    }
};

// Admin API
export const adminAPI = {
    getAllUsers: async () => {
        try {
            const response = await api.get('/users/admin/all');
            return Array.isArray(response.data) ? response.data : 
                   Array.isArray(response.data.data) ? response.data.data : [];
        } catch (error) {
            console.error('Get all users error:', error);
            return [];
        }
    },
    getAllCars: async () => {
        try {
            const response = await api.get('/cars/admin/all');
            return Array.isArray(response.data) ? response.data : 
                   Array.isArray(response.data.data) ? response.data.data : [];
        } catch (error) {
            console.error('Get all cars error:', error);
            return [];
        }
    },
    getAllBookings: async () => {
        try {
            const response = await api.get('/bookings/admin/all');
            return Array.isArray(response.data) ? response.data : 
                   Array.isArray(response.data.data) ? response.data.data : [];
        } catch (error) {
            console.error('Get all bookings error:', error);
            return [];
        }
    },
    updateUserStatus: async (userId, status) => {
        try {
            const response = await api.put(`/users/admin/${userId}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Update user status error:', error);
            throw error;
        }
    },
    deleteUser: async (userId) => {
        try {
            const response = await api.delete(`/users/admin/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Delete user error:', error);
            throw error;
        }
    },
    deleteCar: async (carId) => {
        try {
            console.log('Deleting car with ID:', carId);
            
            // Check if token exists
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found in localStorage');
                throw new Error('Not authenticated. Please log in again.');
            }
            
            const response = await api.delete(`/cars/${carId}`);
            console.log('Delete car response:', response);
            return response.data;
        } catch (error) {
            console.error('Delete car error:', error);
            throw error;
        }
    },
    deleteBooking: async (bookingId) => {
        try {
            console.log('Deleting booking with ID:', bookingId);
            
            // Check if token exists
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found in localStorage');
                throw new Error('Not authenticated. Please log in again.');
            }
            
            // Make the API call
            const response = await api.delete(`/bookings/${bookingId}`);
            console.log('Delete booking response:', response);
            return response.data;
        } catch (error) {
            console.error('Delete booking error:', error);
            throw error;
        }
    },
    updateCarStatus: async (carId, status) => {
        try {
            console.log('Updating car status:', { carId, status });
            const response = await api.put(`/cars/admin/${carId}/status`, { status });
            console.log('Car status update response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Update car status error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config
            });
            throw error;
        }
    }
};

// Car API
export const carAPI = {
    getAllCars: async () => {
        try {
            const response = await api.get('/cars');
            return response.data;
        } catch (error) {
            console.error('Get all cars error:', error);
            throw error;
        }
    },
    getUserCars: async () => {
        try {
            console.log('Requesting user cars...');
            console.log('API base URL:', API_BASE_URL);
            console.log('Full URL:', `${API_BASE_URL}/cars/user/cars`);
            console.log('Auth token:', localStorage.getItem('token'));
            
            const response = await api.get('/cars/user/cars');
            console.log('Get user cars response:', response);
            return response.data;
        } catch (error) {
            console.error('Get user cars error:', error);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            throw error;
        }
    },
    getCarById: async (id) => {
        try {
            console.log('Fetching car details for ID:', id);
            const response = await api.get(`/cars/${id}`);
            console.log('Car details raw response:', response);
            
            // Ensure we have the complete car data
            const carData = response.data || response;
            console.log('Car data:', carData);
            
            // Process images if they exist
            if (carData.images && Array.isArray(carData.images)) {
                carData.images = carData.images.map(img => {
                    if (typeof img === 'object' && img.filename) {
                        return {
                            ...img,
                            url: `http://localhost:3001/uploads/${img.filename}`
                        };
                    } else if (typeof img === 'string') {
                        return {
                            filename: img,
                            url: img.startsWith('http') ? img : `http://localhost:3001/uploads/${img}`
                        };
                    }
                    return img;
                });
            } else if (!carData.images) {
                carData.images = [];
            }
            
            console.log('Processed car data with images:', carData);
            return carData;
        } catch (error) {
            console.error('Get car by id error:', error);
            throw error;
        }
    },
    createCar: async (carData) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };
            const response = await api.post('/cars', carData, config);
            return response.data;
        } catch (error) {
            console.error('Create car error:', error);
            throw error;
        }
    },
    updateCar: async (id, carData) => {
        try {
            const response = await api.put(`/cars/${id}`, carData);
            return response.data;
        } catch (error) {
            console.error('Update car error:', error);
            throw error;
        }
    },
    deleteCar: async (id) => {
        try {
            console.log('Deleting car with ID:', id);
            
            // Check if token exists
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found in localStorage');
                throw new Error('Not authenticated. Please log in again.');
            }
            
            const response = await api.delete(`/cars/${id}`);
            console.log('Delete car response:', response);
            return response.data;
        } catch (error) {
            console.error('Delete car error:', error);
            throw error;
        }
    }
};

// Booking API
export const bookingAPI = {
    createBooking: async (bookingData) => {
        try {
            console.log('Creating booking with data:', bookingData);
            const response = await api.post('/bookings', bookingData);
            console.log('Booking creation response:', response);
            
            // If we have a successful response (201 Created)
            if (response.status === 201) {
                return {
                    ...response.data,
                    success: true
                };
            }
            
            // If we have data but not 201 status
            if (response.data) {
                return response.data;
            }
            
            throw new Error('Invalid response from server');
        } catch (error) {
            console.error('Create booking error:', error);
            
            // If we have a response with error data
            if (error.response?.data) {
                // If the error data is an object with an error message
                if (typeof error.response.data === 'object') {
                    throw {
                        message: error.response.data.error || error.response.data.message || 'Failed to create booking',
                        status: error.response.status,
                        data: error.response.data
                    };
                }
                // If the error data is a string
                throw {
                    message: error.response.data,
                    status: error.response.status
                };
            }
            
            // For network errors or other issues
            throw {
                message: error.message || 'Failed to create booking',
                status: error.response?.status
            };
        }
    },
    getBookings: async () => {
        try {
            const response = await api.get('/bookings');
            return response.data;
        } catch (error) {
            console.error('Get bookings error:', error);
            throw error;
        }
    },
    getBookingById: async (id) => {
        try {
            const response = await api.get(`/bookings/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get booking by id error:', error);
            throw error;
        }
    },
    updateBooking: async (id, bookingData) => {
        try {
            const response = await api.put(`/bookings/${id}`, bookingData);
            return response.data;
        } catch (error) {
            console.error('Update booking error:', error);
            throw error;
        }
    },
    deleteBooking: async (id) => {
        try {
            const response = await api.delete(`/bookings/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete booking error:', error);
            throw error;
        }
    },
    createPaymentIntent: async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Get the booking details to get the amount
            const bookingResponse = await api.get(`/bookings/${bookingId}`);
            const booking = bookingResponse.data;
            
            console.log('Creating payment intent for booking:', {
                bookingId,
                amount: booking.totalPrice
            });

            // Create payment intent using the payments API
            const response = await api.post('/payments/create-payment-intent', {
                amount: booking.totalPrice,
                bookingId: bookingId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Create payment intent error:', error);
            throw error;
        }
    },
    confirmPayment: async (bookingId, paymentIntentId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Update the booking status to 'confirmed'
            const response = await api.put(`/bookings/${bookingId}`, {
                status: 'confirmed',
                paymentIntentId: paymentIntentId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error confirming payment:', error);
            throw error;
        }
    },
};

// Payment API
export const paymentAPI = {
    getStripeConfig: async () => {
        try {
            const response = await api.get('/payments/config');
            return response.data;
        } catch (error) {
            console.error('Get Stripe config error:', error);
            throw error;
        }
    },
    createPaymentIntent: async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Get the booking details to get the amount
            const bookingResponse = await api.get(`/bookings/${bookingId}`);
            const booking = bookingResponse.data;
            
            console.log('Creating payment intent for booking:', {
                bookingId,
                amount: booking.totalPrice
            });

            // Create payment intent using the payments API
            const response = await api.post('/payments/create-payment-intent', {
                amount: booking.totalPrice,
                bookingId: bookingId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Create payment intent error:', error);
            throw error;
        }
    }
};

export default api; 