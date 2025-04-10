import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import { FaUsers, FaCar, FaCalendarAlt, FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import '../dist/admin.css';

const Admin = () => {
    const { user, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [cars, setCars] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (isAdmin()) {
            fetchData();
        }
    }, [isAdmin]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [usersResponse, carsResponse, bookingsResponse] = await Promise.all([
                adminAPI.getAllUsers(),
                adminAPI.getAllCars(),
                adminAPI.getAllBookings()
            ]);

            // Ensure we're working with arrays
            setUsers(Array.isArray(usersResponse) ? usersResponse : []);
            setCars(Array.isArray(carsResponse) ? carsResponse : []);
            setBookings(Array.isArray(bookingsResponse) ? bookingsResponse : []);

            // Log the responses for debugging
            console.log('API Responses:', {
                users: usersResponse,
                cars: carsResponse,
                bookings: bookingsResponse
            });
        } catch (err) {
            console.error('Error fetching admin data:', err);
            setError('Failed to fetch admin data. Please try again later.');
            // Set empty arrays on error
            setUsers([]);
            setCars([]);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await adminAPI.deleteUser(userId);
                setUsers(users.filter(user => user._id !== userId));
            } catch (err) {
                console.error('Error deleting user:', err);
                setError('Failed to delete user. Please try again later.');
            }
        }
    };

    const handleStatusToggle = async (type, id, currentStatus) => {
        try {
            setLoading(true);
            let newStatus;
            
            switch (type) {
                case 'user':
                    newStatus = currentStatus === 'active' ? 'inactive' : 'active';
                    await adminAPI.updateUserStatus(id, newStatus);
                    setUsers(users.map(user => 
                        user._id === id ? { ...user, status: newStatus } : user
                    ));
                    break;
                    
                case 'car':
                    // Toggle between available and inactive
                    newStatus = currentStatus === 'available' ? 'inactive' : 'available';
                    console.log('Attempting to update car status:', { carId: id, currentStatus, newStatus });
                    
                    try {
                        const updatedCar = await adminAPI.updateCarStatus(id, newStatus);
                        console.log('Car status updated successfully:', updatedCar);
                        setCars(cars.map(car => 
                            car._id === id ? { ...car, status: updatedCar.status } : car
                        ));
                    } catch (carError) {
                        console.error('Car status update failed:', carError);
                        // Revert the status in the UI
                        setCars(cars.map(car => 
                            car._id === id ? { ...car, status: currentStatus } : car
                        ));
                        throw carError;
                    }
                    break;
                    
                case 'booking':
                    newStatus = currentStatus === 'active' ? 'inactive' : 'active';
                    await adminAPI.updateBookingStatus(id, newStatus);
                    setBookings(bookings.map(booking => 
                        booking._id === id ? { ...booking, status: newStatus } : booking
                    ));
                    break;
            }
        } catch (err) {
            console.error(`Error toggling ${type} status:`, err);
            setError(`Failed to update ${type} status. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const handleEditCar = (carId) => {
        // Implementation of handleEditCar function
    };

    const handleDeleteCar = async (carId) => {
        if (window.confirm('Are you sure you want to delete this car?')) {
            try {
                setLoading(true);
                setError(null);
                await adminAPI.deleteCar(carId);
                setCars(prevCars => prevCars.filter(car => car._id !== carId));
                setSuccessMessage('Car deleted successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (error) {
                console.error('Error deleting car:', error);
                setError(error.response?.data?.error || error.message || 'Failed to delete car');
                setTimeout(() => setError(null), 3000);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            try {
                setLoading(true);
                await adminAPI.deleteBooking(bookingId);
                setBookings(prevBookings => prevBookings.filter(booking => booking._id !== bookingId));
                setSuccessMessage('Booking deleted successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (error) {
                setError(error.message || 'Failed to delete booking');
                setTimeout(() => setError(''), 3000);
            } finally {
                setLoading(false);
            }
        }
    };

    const filteredCars = cars.filter(car => {
        const matchesSearch = car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             car.model.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === '' || car.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const processCarImage = (car) => {
        if (!car.images || car.images.length === 0) {
            return {
                ...car,
                imageUrl: 'https://via.placeholder.com/300x200?text=No+Image'
            };
        }

        // Get the first image
        const image = car.images[0];
        
        // If it's already a full URL, use it
        if (image.url && image.url.startsWith('http')) {
            return {
                ...car,
                imageUrl: image.url
            };
        }
        
        // If it's a filename, construct the URL using the backend server
        const imageUrl = `http://localhost:3001/uploads/${image.filename || image}`;
        
        return {
            ...car,
            imageUrl
        };
    };

    if (!isAdmin()) {
        return (
            <div className="admin-container">
                <h1>Access Denied</h1>
                <p>You do not have permission to access this page.</p>
            </div>
        );
    }

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
                <div className="error-message">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-dashboard">
                <h1>Admin Dashboard</h1>
                <p>Manage users, cars, and bookings</p>
            </div>

            <div className="admin-nav-buttons">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`admin-nav-button ${activeTab === 'users' ? 'active' : ''}`}
                >
                    <FaUsers /> Users
                </button>
                <button
                    onClick={() => setActiveTab('cars')}
                    className={`admin-nav-button ${activeTab === 'cars' ? 'active' : ''}`}
                >
                    <FaCar /> Cars
                </button>
                <button
                    onClick={() => setActiveTab('bookings')}
                    className={`admin-nav-button ${activeTab === 'bookings' ? 'active' : ''}`}
                >
                    <FaCalendarAlt /> Bookings
                </button>
            </div>

            {activeTab === 'users' && (
                <div className="table-container">
                    <div className="table-toolbar">
                        <div className="search-box">
                            <input type="text" placeholder="Search users..." />
                        </div>
                    </div>
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
                                    <td>
                                        <div className="status-toggle">
                                            <span className={`status-badge ${user.status === 'active' ? 'active' : 'inactive'}`}>
                                                {user.status || 'active'}
                                            </span>
                                            <button
                                                onClick={() => handleStatusToggle('user', user._id, user.status || 'active')}
                                                className={`toggle-button ${(user.status || 'active') === 'active' ? 'active' : ''}`}
                                                disabled={loading}
                                            >
                                                <span className="toggle-slider"></span>
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="action-button delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'cars' && (
                <div className="table-container">
                    <div className="car-filters">
                        <div className="car-search">
                            <i className="fas fa-search"></i>
                            <input 
                                type="text" 
                                placeholder="Search cars..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select 
                            className="car-filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="available">Available</option>
                            <option value="rented">Rented</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <table className="car-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Details</th>
                                <th>Specifications</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCars.map(car => (
                                <tr key={car._id}>
                                    <td className="car-image-cell">
                                        <div className="car-image-container">
                                            {car.images && car.images.length > 0 ? (
                                                <>
                                                    <img 
                                                        src={processCarImage(car).imageUrl} 
                                                        alt={`${car.make} ${car.model}`} 
                                                        className="car-image"
                                                    />
                                                    <div className="car-image-overlay"></div>
                                                    <div className="car-image-actions">
                                                        <button className="car-image-action-button" title="View Image">
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                        <button className="car-image-action-button" title="Change Image">
                                                            <i className="fas fa-camera"></i>
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="car-image-placeholder">
                                                    <i className="fas fa-car"></i>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="car-title">{car.make} {car.model}</div>
                                        <div className="car-year">{car.year}</div>
                                    </td>
                                    <td>
                                        <div className="car-specs">
                                            <div className="car-spec">
                                                <i className="fas fa-cogs"></i>
                                                <span>{car.transmission}</span>
                                            </div>
                                            <div className="car-spec">
                                                <i className="fas fa-gas-pump"></i>
                                                <span>{car.fuelType}</span>
                                            </div>
                                            <div className="car-spec">
                                                <i className="fas fa-users"></i>
                                                <span>{car.seats} Seats</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="car-price">₹{car.pricePerDay}/day</div>
                                    </td>
                                    <td>
                                        <div className="car-status">
                                            <span className={`car-status-badge ${car.status}`}>
                                                {car.status}
                                            </span>
                                            <button
                                                onClick={() => handleStatusToggle('car', car._id, car.status || 'available')}
                                                className={`toggle-button ${(car.status || 'available') === 'available' ? 'active' : ''}`}
                                                disabled={loading}
                                            >
                                                <span className="toggle-slider"></span>
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="car-actions">
                                            <button 
                                                className="car-action-button edit"
                                                onClick={() => handleEditCar(car._id)}
                                            >
                                                <i className="fas fa-edit"></i>
                                                Edit
                                            </button>
                                            <button 
                                                className="car-action-button delete"
                                                onClick={() => handleDeleteCar(car._id)}
                                            >
                                                <i className="fas fa-trash"></i>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'bookings' && (
                <div className="table-container">
                    <div className="table-toolbar">
                        <div className="search-box">
                            <input type="text" placeholder="Search bookings..." />
                        </div>
                    </div>
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
                                    <td>{booking.userId?.name || 'N/A'}</td>
                                    <td>{booking.carId?.make} {booking.carId?.model}</td>
                                    <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                                    <td>{new Date(booking.endDate).toLocaleDateString()}</td>
                                    <td>
                                        <div className="status-toggle">
                                            <span className={`status-badge ${booking.status === 'active' ? 'active' : 'inactive'}`}>
                                                {booking.status || 'active'}
                                            </span>
                                            <button
                                                onClick={() => handleStatusToggle('booking', booking._id, booking.status || 'active')}
                                                className={`toggle-button ${(booking.status || 'active') === 'active' ? 'active' : ''}`}
                                                disabled={loading}
                                            >
                                                <span className="toggle-slider"></span>
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="action-button edit">
                                                <FaEdit />
                                            </button>
                                            <button className="action-button delete" onClick={() => handleDeleteBooking(booking._id)}>
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Admin; 