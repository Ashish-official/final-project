import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, carAPI } from '../services/api';
import { useLocation } from 'react-router-dom';
import "../dist/myBookings.css";
// Import default car image
import defaultCarImg from '../images/cars-big/carforbox.jpg';

const processCarImage = (car) => {
    if (!car) return defaultCarImg;
    
    // If car has images array with valid entries
    if (car.images && Array.isArray(car.images) && car.images.length > 0) {
        const firstImage = car.images[0];
        // Handle both object and string image formats
        if (typeof firstImage === 'object' && firstImage.filename) {
            return `http://localhost:3001/uploads/${firstImage.filename}`;
        } else if (typeof firstImage === 'string') {
            return firstImage.startsWith('http') ? firstImage : `http://localhost:3001/uploads/${firstImage}`;
        }
    }
    
    // If car has a single image property
    if (car.image) {
        return typeof car.image === 'string' 
            ? (car.image.startsWith('http') ? car.image : `http://localhost:3001/uploads/${car.image}`)
            : defaultCarImg;
    }
    
    return defaultCarImg;
};

const MyBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const location = useLocation();

    useEffect(() => {
        const fetchBookingsWithCarDetails = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await bookingAPI.getBookings();
                console.log('Initial bookings response:', response);

                let bookingsData = [];
                if (Array.isArray(response)) {
                    bookingsData = response;
                } else if (response && Array.isArray(response.data)) {
                    bookingsData = response.data;
                } else if (response && response.data) {
                    bookingsData = [response.data];
                }

                // Fetch car details for each booking
                const enhancedBookings = await Promise.all(
                    bookingsData.map(async (booking) => {
                        try {
                            if (!booking.carId && !booking.car) {
                                throw new Error('No car ID found in booking');
                            }

                            const carId = booking.carId || booking.car._id;
                            console.log('Processing booking:', {
                                bookingId: booking._id,
                                carId: carId,
                                originalBooking: booking
                            });

                            const carResponse = await carAPI.getCarById(carId);
                            console.log('Car API Response:', carResponse);
                            
                            // Extract car details
                            const carDetails = carResponse.data || carResponse;
                            
                            if (!carDetails) {
                                throw new Error('No car details received');
                            }

                            // Process car images
                            let carImages = [];
                            
                            // Check all possible image sources
                            if (carDetails.images && Array.isArray(carDetails.images)) {
                                carImages = carDetails.images;
                            } else if (carDetails.images) {
                                carImages = [carDetails.images];
                            } else if (carDetails.image) {
                                carImages = [carDetails.image];
                            }

                            // Process each image URL
                            carImages = carImages.map(img => {
                                if (!img) return null;
                                
                                if (typeof img === 'string') {
                                    return img.startsWith('http') ? img : `http://localhost:3001/uploads/${img}`;
                                }
                                
                                if (typeof img === 'object' && img.filename) {
                                    return `http://localhost:3001/uploads/${img.filename}`;
                                }
                                
                                return null;
                            }).filter(Boolean);

                            // If no valid images found, use default
                            if (carImages.length === 0) {
                                carImages = [defaultCarImg];
                            }

                            // Get pickup and dropoff locations from all possible sources
                            const pickupLocation = 
                                booking.pickupLocation || 
                                booking.pickup || 
                                (booking.locations && booking.locations.pickup) || 
                                'Not specified';

                            const dropoffLocation = 
                                booking.dropoffLocation || 
                                booking.dropoff || 
                                (booking.locations && booking.locations.dropoff) || 
                                'Not specified';

                            // Create enhanced booking object
                            const enhancedBooking = {
                                ...booking,
                                car: {
                                    ...carDetails,
                                    images: carImages,
                                    make: carDetails.make || 'Unknown Make',
                                    model: carDetails.model || 'Unknown Model',
                                    pricePerDay: Number(carDetails.pricePerDay) || 0
                                },
                                pickupLocation,
                                dropoffLocation,
                                totalPrice: Number(booking.totalPrice) || 0,
                                status: booking.status || 'Pending'
                            };

                            console.log('Enhanced booking object:', {
                                id: enhancedBooking._id,
                                car: {
                                    make: enhancedBooking.car.make,
                                    model: enhancedBooking.car.model,
                                    images: enhancedBooking.car.images
                                },
                                pickup: enhancedBooking.pickupLocation,
                                dropoff: enhancedBooking.dropoffLocation,
                                totalPrice: enhancedBooking.totalPrice
                            });

                            return enhancedBooking;
                        } catch (err) {
                            console.error(`Error processing booking ${booking._id}:`, err);
                            // Return a well-structured fallback object
                            return {
                                ...booking,
                                car: {
                                    make: booking.car?.make || booking.carMake || 'Unknown Make',
                                    model: booking.car?.model || booking.carModel || 'Unknown Model',
                                    images: [defaultCarImg],
                                    pricePerDay: Number(booking.car?.pricePerDay) || 0
                                },
                                pickupLocation: booking.pickupLocation || booking.pickup || 
                                    (booking.locations && booking.locations.pickup) || 'Not specified',
                                dropoffLocation: booking.dropoffLocation || booking.dropoff || 
                                    (booking.locations && booking.locations.dropoff) || 'Not specified',
                                totalPrice: Number(booking.totalPrice) || 0,
                                status: booking.status || 'Pending'
                            };
                        }
                    })
                );

                // Sort bookings by date (most recent first)
                enhancedBookings.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
                
                console.log('Final enhanced bookings:', enhancedBookings);
                setBookings(enhancedBookings);
            } catch (err) {
                console.error('Error fetching bookings:', err);
                setError('Failed to load your bookings. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchBookingsWithCarDetails();
        } else {
            setError('Please log in to view your bookings');
            setLoading(false);
        }
    }, [user]);

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Invalid Date';
        }
    };

    const getStatusClass = (status) => {
        status = status?.toLowerCase() || 'pending';
        switch (status) {
            case 'active':
                return 'active';
            case 'completed':
                return 'completed';
            case 'cancelled':
                return 'cancelled';
            case 'pending':
                return 'pending';
            default:
                return 'pending';
        }
    };

    const calculateTotalPrice = (startDate, endDate, pricePerDay) => {
        if (!startDate || !endDate || !pricePerDay) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        return days * pricePerDay;
    };

    if (loading) return (
        <div className="loading">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Loading your bookings...</span>
        </div>
    );
    
    if (error) return (
        <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
        </div>
    );

    return (
        <div className="my-bookings-container">
            <div className="my-bookings-content">
                <h1>My Bookings</h1>
                
                {location.state?.message && (
                    <div className="success-message">
                        <i className="fas fa-check-circle"></i>
                        {location.state.message}
                    </div>
                )}
                
                {bookings.length === 0 ? (
                    <div className="no-bookings">
                        <i className="fas fa-calendar-alt"></i>
                        <p>You haven't made any bookings yet.</p>
                        <a href="/cars" className="browse-cars-button">
                            <i className="fas fa-car"></i>
                            Browse Cars
                        </a>
                    </div>
                ) : (
                    <div className="bookings-grid">
                        {bookings.map(booking => {
                            const carDetails = booking.car || {};
                            console.log('Rendering booking:', {
                                bookingId: booking._id,
                                carDetails,
                                images: carDetails.images,
                                pickup: booking.pickupLocation,
                                dropoff: booking.dropoffLocation
                            });

                            // Get the first valid image or default
                            const carImage = carDetails.images && carDetails.images.length > 0
                                ? carDetails.images[0]
                                : defaultCarImg;

                            return (
                                <div key={booking._id} className="booking-card">
                                    <div className="status-badge">
                                        <span className={getStatusClass(booking.status)}>
                                            {booking.status || 'Pending'}
                                        </span>
                                    </div>
                                    <div className="car-image">
                                        <img 
                                            src={carImage}
                                            alt={`${carDetails.make} ${carDetails.model}`}
                                            onError={(e) => {
                                                console.error('Image load error:', e.target.src);
                                                e.target.src = defaultCarImg;
                                                e.target.onerror = null; // Prevent infinite loop
                                            }}
                                        />
                                    </div>
                                    <div className="booking-details">
                                        <h3>{carDetails.make} {carDetails.model}</h3>
                                        <div className="booking-info">
                                            <div className="info-row">
                                                <span className="label">Start Date:</span>
                                                <span className="value">{formatDate(booking.startDate)}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">End Date:</span>
                                                <span className="value">{formatDate(booking.endDate)}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">Pickup:</span>
                                                <span className="value">
                                                    {booking.pickupLocation && booking.pickupLocation !== 'Not specified' 
                                                        ? booking.pickupLocation 
                                                        : 'Not specified'}
                                                </span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">Drop-off:</span>
                                                <span className="value">
                                                    {booking.dropoffLocation && booking.dropoffLocation !== 'Not specified'
                                                        ? booking.dropoffLocation
                                                        : 'Not specified'}
                                                </span>
                                            </div>
                                            <div className="info-row total-price">
                                                <span className="label">Total Price:</span>
                                                <span className="value">
                                                    {booking.totalPrice ? 
                                                        `₹${booking.totalPrice.toLocaleString('en-IN')}` : 
                                                        (carDetails.pricePerDay ? 
                                                            `₹${calculateTotalPrice(booking.startDate, booking.endDate, carDetails.pricePerDay).toLocaleString('en-IN')}` : 
                                                            'Not available'
                                                        )
                                                    }
                                                </span>
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

export default MyBookings; 