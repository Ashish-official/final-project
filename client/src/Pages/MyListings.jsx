import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { carAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import "../dist/myBookings.css";

// Add default image data URL
const defaultCarImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2YwZjBmMCIgLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KICA8cGF0aCBkPSJNNDAgNzBDNjAgNTAgOTAgNDAgMTIwIDUwQzE1MCA2MCAxODAgOTAgMTcwIDcwIiBzdHJva2U9IiM5OTkiIGZpbGw9Im5vbmUiIC8+Cjwvc3ZnPg==';

const MyListings = () => {
    const { user, isAuthenticated } = useAuth();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Logger for auth status
    useEffect(() => {
        console.log('Auth status:', { 
            isAuthenticated: isAuthenticated(), 
            user 
        });
        
        if (isAuthenticated()) {
            console.log('User is authenticated. User data:', user);
        } else {
            console.log('User is not authenticated');
        }
    }, [user, isAuthenticated]);

    useEffect(() => {
        const fetchUserListings = async () => {
            try {
                setLoading(true);
                setError('');
                
                if (!isAuthenticated()) {
                    console.error('Cannot fetch listings - user is not authenticated');
                    setError('Please log in to view your listings');
                    setLoading(false);
                    return;
                }
                
                console.log('Token from localStorage:', localStorage.getItem('token'));
                console.log('Fetching user cars...');
                
                const response = await carAPI.getUserCars();
                console.log('API Response:', response);
                
                // Handle different response formats
                let carData = [];
                if (Array.isArray(response)) {
                    carData = response;
                } else if (response && Array.isArray(response.data)) {
                    carData = response.data;
                } else if (response && response.data) {
                    carData = [response.data];
                }
                
                console.log('Extracted car data:', carData);
                
                // Process image URLs
                carData = carData.map(car => {
                    console.log('Processing car:', car);
                    console.log('Car images:', car.images);
                    
                    // Handle image objects with path and filename
                    const processedImages = car.images?.map(img => {
                        if (typeof img === 'object' && img.filename) {
                            const imageUrl = `http://localhost:3001/uploads/${img.filename}`;
                            console.log('Generated image URL:', imageUrl);
                            return imageUrl;
                        } else if (typeof img === 'string') {
                            // If the image is already a full URL, use it directly
                            return img.startsWith('http') ? img : `http://localhost:3001/uploads/${img}`;
                        }
                        return defaultCarImage;
                    }) || [defaultCarImage];
                    
                    return {
                        ...car,
                        images: processedImages
                    };
                });
                
                console.log('Final processed car data:', carData);
                setCars(carData);
                
            } catch (err) {
                console.error('Error fetching listings:', err);
                console.error('Error details:', { 
                    message: err.message,
                    status: err.response?.status,
                    data: err.response?.data
                });
                
                if (err.response?.status === 401) {
                    setError('Authentication error. Please log in again.');
                } else if (err.response?.status === 404) {
                    setError('The requested resource was not found.');
                } else {
                    setError(err.response?.data?.message || 'Failed to load your car listings');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserListings();
    }, [user, isAuthenticated]);

    const handleEditCar = (carId) => {
        navigate(`/edit-car/${carId}`);
    };

    const handleViewCar = (carId) => {
        navigate(`/car-details/${carId}`);
    };

    if (loading) {
        return (
            <div className="my-listings-container">
                <div className="my-listings-content">
                    <div className="listings-header">
                        <h1>My Car Listings</h1>
                    </div>
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading your car listings...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-listings-container">
                <div className="my-listings-content">
                    <div className="listings-header">
                        <h1>My Car Listings</h1>
                    </div>
                    <div className="error-container">
                        <div className="error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            <p>{error}</p>
                        </div>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="retry-button"
                        >
                            <i className="fas fa-sync"></i> Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-listings-container">
            <div className="my-listings-content">
                <div className="listings-header">
                    <h1>My Car Listings</h1>
                    <button 
                        className="add-listing-button"
                        onClick={() => navigate('/host-car')}
                    >
                        <i className="fas fa-plus"></i> Add New Car
                    </button>
                </div>
                
                {cars.length === 0 ? (
                    <div className="empty-listings">
                        <div className="empty-illustration">
                            <i className="fas fa-car-side"></i>
                        </div>
                        <h2>No Cars Listed Yet</h2>
                        <p>Start earning by listing your car for rent</p>
                        <a href="/host-car" className="add-car-button">List Your Car</a>
                    </div>
                ) : (
                    <div className="listings-grid">
                        {cars.map(car => {
                            console.log('Rendering car:', car);
                            const imageUrl = car.images?.[0] || defaultCarImage;
                            console.log('Image URL:', imageUrl);
                            return (
                                <div key={car._id} className="listing-card">
                                    <div className="listing-image">
                                        <img 
                                            src={imageUrl}
                                            alt={`${car.make} ${car.model}`}
                                            onError={(e) => {
                                                console.error('Image load error for car:', car._id);
                                                console.error('Failed image URL:', imageUrl);
                                                e.target.src = defaultCarImage;
                                            }}
                                        />
                                        <div className={`listing-status ${car.status?.toLowerCase() || 'active'}`}>
                                            {car.status || 'Available'}
                                        </div>
                                    </div>
                                    <div className="listing-info">
                                        <div className="listing-details">
                                            <div className="car-info">
                                                <h3>{car.make} {car.model}</h3>
                                                <p className="year">{car.year}</p>
                                                <div className="car-specs">
                                                    <span><i className="fas fa-car"></i> {car.type}</span>
                                                    <span><i className="fas fa-cog"></i> {car.transmission}</span>
                                                    <span><i className="fas fa-gas-pump"></i> {car.fuelType}</span>
                                                    <span><i className="fas fa-users"></i> {car.seats} seats</span>
                                                    <span><i className="fas fa-map-marker-alt"></i> {car.city || 'Location not specified'}</span>
                                                    {car.state && <span><i className="fas fa-map"></i> {car.state}</span>}
                                                </div>
                                                <div className="car-price">
                                                    <span className="price">₹{car.pricePerDay}</span>
                                                    <span className="per-day">/day</span>
                                                </div>
                                            </div>
                                            <div className="car-features">
                                                <h4>Features</h4>
                                                <div className="features-list">
                                                    {car.features && car.features.slice(0, 3).map((feature, index) => (
                                                        <span key={index} className="feature-tag">{feature}</span>
                                                    ))}
                                                    {car.features && car.features.length > 3 && (
                                                        <span className="feature-tag">+{car.features.length - 3} more</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyListings; 