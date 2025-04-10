import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { carAPI, bookingAPI } from '../services/api';
import StripePayment from '../components/StripePayment';
import "../dist/booking.css";

// Default image as a data URL for fallback
const defaultCarImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2YwZjBmMCIgLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KICA8cGF0aCBkPSJNNDAgNzBDNjAgNTAgOTAgNDAgMTIwIDUwQzE1MCA2MCAxODAgOTAgMTcwIDcwIiBzdHJva2U9IiM5OTkiIGZpbGw9Im5vbmUiIC8+Cjwvc3ZnPg==';

const Booking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookingData, setBookingData] = useState({
        startDate: '',
        endDate: '',
        pickupLocation: '',
        dropoffLocation: '',
        totalPrice: 0
    });
    const [showPayment, setShowPayment] = useState(false);
    const [bookingId, setBookingId] = useState(null);

    useEffect(() => {
        console.log('Booking component mounted');
        console.log('User authenticated:', isAuthenticated);
        console.log('Car ID:', id);
        const fetchCar = async () => {
            try {
                const response = await carAPI.getCarById(id);
                console.log('Full API response:', response);
                const carDetails = response.data || response;
                console.log('Car details extracted:', carDetails);
                setCar(carDetails);
                setError(''); // Clear any previous errors
            } catch (err) {
                setError('Failed to load car details');
                console.error('Error fetching car:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCar();
    }, [id]);

    useEffect(() => {
        if (!isAuthenticated) {
            console.log('User not authenticated, redirecting to sign-in');
            navigate('/signin', { state: { from: `/booking/${id}` } });
        }
    }, [isAuthenticated, navigate, id]);

    const calculateTotalPrice = () => {
        if (!bookingData.startDate || !bookingData.endDate || !car?.pricePerDay) return 0;
        
        const start = new Date(bookingData.startDate);
        const end = new Date(bookingData.endDate);
        const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        
        return days * car.pricePerDay;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({
            ...prev,
            [name]: value,
            totalPrice: calculateTotalPrice()
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate required fields
            if (!bookingData.startDate || !bookingData.endDate || !bookingData.pickupLocation || !bookingData.dropoffLocation) {
                throw new Error('Please fill in all required fields');
            }

            // Validate dates
            const start = new Date(bookingData.startDate);
            const end = new Date(bookingData.endDate);
            const now = new Date();

            if (start < now) {
                throw new Error('Start date cannot be in the past');
            }

            if (end <= start) {
                throw new Error('End date must be after start date');
            }

            // Calculate total price
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            const totalPrice = days * car.pricePerDay;

            const bookingResponse = await bookingAPI.createBooking({
                ...bookingData,
                carId: car._id,
                totalPrice,
            });

            console.log('Booking created:', bookingResponse);

            if (bookingResponse.error) {
                throw new Error(bookingResponse.error);
            }

            setBookingId(bookingResponse._id);
            setShowPayment(true);
        } catch (err) {
            console.error('Error creating booking:', err);
            setError(err.message || 'Failed to create booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async (paymentIntentId) => {
        try {
            setLoading(true);
            await bookingAPI.confirmPayment(bookingId, paymentIntentId);
            navigate('/my-bookings');
        } catch (err) {
            console.error('Error confirming payment:', err);
            setError(err.message || 'Failed to confirm payment. Please contact support.');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentCancel = () => {
        setShowPayment(false);
        setBookingId(null);
    };

    useEffect(() => {
        // Update total price whenever dates change
        const newTotalPrice = calculateTotalPrice();
        setBookingData(prev => ({
            ...prev,
            totalPrice: newTotalPrice
        }));
    }, [bookingData.startDate, bookingData.endDate]);

    if (loading) {
        console.log('Loading car details...');
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        console.log('Error encountered:', error);
        return <div className="error-message">{error}</div>;
    }

    if (!car) {
        console.log('Car not found');
        return <div className="error-message">Car not found</div>;
    }

    console.log('Rendering booking form for car:', car);
    console.log('Car object:', car);

    const imageUrl = car.images && car.images.length > 0 ? `http://localhost:3001/uploads/${car.images[0].filename}` : defaultCarImage;

    if (showPayment && bookingId) {
        return (
            <StripePayment
                bookingId={bookingId}
                amount={bookingData.totalPrice}
                car={car}
                dates={{
                    start: bookingData.startDate,
                    end: bookingData.endDate,
                }}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
            />
        );
    }

    return (
        <div className="booking-container">
            <div className="booking-content">
                <h1>Book Your Ride</h1>
                
                {error && (
                    <div className="error-message" style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '2rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}
                
                <div className="car-details">
                    <img 
                        src={imageUrl} 
                        alt={`${car.make} ${car.model}`} 
                        onError={(e) => {
                            console.error('Image load error');
                            e.target.src = defaultCarImage;
                        }}
                    />
                    <div className="car-info">
                        <h2>{car.make} {car.model}</h2>
                        <p>Year: {car.year}</p>
                        <p>Type: {car.type}</p>
                        <p className="price-per-day">Price per day: ₹{car.pricePerDay.toLocaleString('en-IN')}</p>
                        <p>Transmission: {car.transmission}</p>
                        <p>Fuel Type: {car.fuelType}</p>
                        <p>Seats: {car.seats}</p>
                        <p>{car.description}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="booking-form">
                    <div className="form-group">
                        <label htmlFor="startDate">Start Date *</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={bookingData.startDate}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="endDate">End Date *</label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={bookingData.endDate}
                            onChange={handleChange}
                            min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="pickupLocation">Pickup Location *</label>
                        <input
                            type="text"
                            id="pickupLocation"
                            name="pickupLocation"
                            value={bookingData.pickupLocation}
                            onChange={handleChange}
                            placeholder="Enter pickup location"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="dropoffLocation">Drop-off Location *</label>
                        <input
                            type="text"
                            id="dropoffLocation"
                            name="dropoffLocation"
                            value={bookingData.dropoffLocation}
                            onChange={handleChange}
                            placeholder="Enter drop-off location"
                            required
                        />
                    </div>

                    <div className="price-summary">
                        <h3>Price Summary</h3>
                        <div className="price-details">
                            <div className="price-row">
                                <span>Total Days:</span>
                                <span>{bookingData.startDate && bookingData.endDate ? 
                                    Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24)) : 0}</span>
                            </div>
                            <div className="price-row">
                                <span>Price per day:</span>
                                <span>₹{car.pricePerDay.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="price-row total">
                                <span>Total Price:</span>
                                <span>₹{calculateTotalPrice().toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Processing...' : 'Confirm Booking'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Booking; 