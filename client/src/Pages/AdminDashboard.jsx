import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, carAPI, bookingAPI } from '../services/api';
import "../dist/admin.css";

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [cars, setCars] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            switch (activeTab) {
                case 'users':
                    const usersResponse = await userAPI.getAllUsers();
                    setUsers(usersResponse.data);
                    break;
                case 'cars':
                    const carsResponse = await carAPI.getAllCars();
                    setCars(carsResponse.data);
                    break;
                case 'bookings':
                    const bookingsResponse = await bookingAPI.getAllBookings();
                    setBookings(bookingsResponse.data);
                    break;
            }
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (type, id, newStatus) => {
        try {
            switch (type) {
                case 'user':
                    await userAPI.updateUserStatus(id, newStatus);
                    break;
                case 'car':
                    await carAPI.updateCarStatus(id, newStatus);
                    break;
                case 'booking':
                    await bookingAPI.updateBookingStatus(id, newStatus);
                    break;
            }
            fetchData(); // Refresh data after update
        } catch (err) {
            setError('Failed to update status. Please try again.');
            console.error('Error updating status:', err);
        }
    };

    if (loading) {
        return (
            <div className="admin-container">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-container">
                <div className="error">{error}</div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-sidebar">
                <h2>Admin Dashboard</h2>
                <nav>
                    <button 
                        className={activeTab === 'users' ? 'active' : ''} 
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                    <button 
                        className={activeTab === 'cars' ? 'active' : ''} 
                        onClick={() => setActiveTab('cars')}
                    >
                        Cars
                    </button>
                    <button 
                        className={activeTab === 'bookings' ? 'active' : ''} 
                        onClick={() => setActiveTab('bookings')}
                    >
                        Bookings
                    </button>
                </nav>
            </div>

            <div className="admin-content">
                {activeTab === 'users' && (
                    <div className="admin-section">
                        <h2>User Management</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td>{user.status}</td>
                                        <td>
                                            <button 
                                                onClick={() => handleStatusChange('user', user._id, user.status === 'active' ? 'inactive' : 'active')}
                                                className={user.status === 'active' ? 'deactivate' : 'activate'}
                                            >
                                                {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'cars' && (
                    <div className="admin-section">
                        <h2>Car Management</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Make</th>
                                    <th>Model</th>
                                    <th>Price/Day</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cars.map(car => (
                                    <tr key={car._id}>
                                        <td>
                                            <img src={car.imageUrl} alt={`${car.make} ${car.model}`} className="car-thumbnail" />
                                        </td>
                                        <td>{car.make}</td>
                                        <td>{car.model}</td>
                                        <td>${car.pricePerDay}</td>
                                        <td>{car.status}</td>
                                        <td>
                                            <button 
                                                onClick={() => handleStatusChange('car', car._id, car.status === 'active' ? 'inactive' : 'active')}
                                                className={car.status === 'active' ? 'deactivate' : 'activate'}
                                            >
                                                {car.status === 'active' ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <div className="admin-section">
                        <h2>Booking Management</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Car</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking._id}>
                                        <td>{booking.user.name}</td>
                                        <td>{booking.car.make} {booking.car.model}</td>
                                        <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                                        <td>{new Date(booking.endDate).toLocaleDateString()}</td>
                                        <td>{booking.status}</td>
                                        <td>
                                            <button 
                                                onClick={() => handleStatusChange('booking', booking._id, 'approved')}
                                                className="approve"
                                                disabled={booking.status === 'approved'}
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange('booking', booking._id, 'rejected')}
                                                className="reject"
                                                disabled={booking.status === 'rejected'}
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard; 