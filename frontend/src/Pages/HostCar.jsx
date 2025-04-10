import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { carAPI } from '../services/api';
import "../dist/hostCar.css";

const INITIAL_FORM_STATE = {
    make: '',
    model: '',
    year: '',
    type: '',
    transmission: '',
    fuelType: '',
    seats: '',
    pricePerDay: '',
    description: '',
    features: {
        ac: false,
        gps: false,
        bluetooth: false,
        usb: false,
        parkingSensors: false,
        backupCamera: false
    },
    images: [],
    city: '',
    state: '',
    address: ''
};

const HostCar = () => {
    const navigate = useNavigate();
    const [carData, setCarData] = useState(INITIAL_FORM_STATE);
    const [validationErrors, setValidationErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setCarData(prev => ({
                ...prev,
                features: {
                    ...prev.features,
                    [name]: checked
                }
            }));
        } else {
            setCarData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        // Clear validation error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setCarData(prev => ({
                ...prev,
                images: files
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        
        // Validate required fields
        if (!carData.make.trim()) {
            errors.make = 'Make is required';
        }
        if (!carData.model.trim()) {
            errors.model = 'Model is required';
        }
        if (!carData.year) {
            errors.year = 'Year is required';
        } else if (isNaN(carData.year) || carData.year < 1900 || carData.year > new Date().getFullYear()) {
            errors.year = 'Please enter a valid year';
        }
        if (!carData.pricePerDay) {
            errors.pricePerDay = 'Price per day is required';
        } else if (isNaN(carData.pricePerDay) || carData.pricePerDay <= 0) {
            errors.pricePerDay = 'Please enter a valid price';
        }
        if (!carData.type) {
            errors.type = 'Type is required';
        }
        if (!carData.transmission) {
            errors.transmission = 'Transmission is required';
        }
        if (!carData.fuelType) {
            errors.fuelType = 'Fuel type is required';
        }
        if (!carData.seats) {
            errors.seats = 'Number of seats is required';
        } else if (isNaN(carData.seats) || carData.seats < 1 || carData.seats > 10) {
            errors.seats = 'Please enter a valid number of seats (1-10)';
        }
        if (!carData.description.trim()) {
            errors.description = 'Description is required';
        }
        if (!carData.city.trim()) {
            errors.city = 'City is required';
        }

        // Validate features
        const selectedFeatures = Object.entries(carData.features)
            .filter(([_, value]) => value)
            .map(([key]) => key);
        
        if (selectedFeatures.length === 0) {
            errors.features = 'Please select at least one feature';
        }

        setValidationErrors(errors);
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setApiError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('make', carData.make.trim());
            formData.append('model', carData.model.trim());
            formData.append('year', carData.year);
            formData.append('pricePerDay', carData.pricePerDay);
            formData.append('type', carData.type);
            formData.append('transmission', carData.transmission);
            formData.append('fuelType', carData.fuelType);
            formData.append('seats', carData.seats);
            formData.append('description', carData.description.trim());
            formData.append('city', carData.city.trim());
            formData.append('state', carData.state.trim());
            formData.append('address', carData.address.trim());
            
            // Format features array correctly
            const featuresArray = Object.entries(carData.features)
                .filter(([_, value]) => value)
                .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));
            formData.append('features', JSON.stringify(featuresArray));

            // Handle images
            if (carData.images && carData.images.length > 0) {
                carData.images.forEach(image => {
                    formData.append('images', image);
                });
            } else {
                setApiError('At least one image is required');
                setIsSubmitting(false);
                return;
            }

            // Log the FormData contents for debugging
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            const response = await carAPI.createCar(formData);
            console.log('Car created successfully:', response);
            setSuccess('Car listed successfully!');
            
            // Clear form after successful submission
            setCarData(INITIAL_FORM_STATE);
            
            // Redirect to my listings page after a short delay
            setTimeout(() => {
                navigate('/my-listings');
            }, 1500);
            
        } catch (err) {
            console.error('Error creating car:', err);
            setApiError(err.response?.data?.error || 'Failed to create car listing');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="host-car-container">
            <div className="host-car-content">
                <h1>Host Your Car</h1>
                <p>Fill out the form below to list your car for rent.</p>
                
                {apiError && <div className="error-message">{apiError}</div>}
                {success && <div className="success-message">{success}</div>}
                
                <form onSubmit={handleSubmit} className="host-car-form">
                    <div className="form-group">
                        <label htmlFor="make">Make *</label>
                        <input
                            type="text"
                            id="make"
                            name="make"
                            value={carData.make}
                            onChange={handleChange}
                            className={validationErrors.make ? 'error' : ''}
                            placeholder="e.g., Toyota"
                        />
                        {validationErrors.make && <span className="error-message">{validationErrors.make}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="model">Model *</label>
                        <input
                            type="text"
                            id="model"
                            name="model"
                            value={carData.model}
                            onChange={handleChange}
                            className={validationErrors.model ? 'error' : ''}
                            placeholder="e.g., Camry"
                        />
                        {validationErrors.model && <span className="error-message">{validationErrors.model}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="year">Year *</label>
                        <input
                            type="number"
                            id="year"
                            name="year"
                            value={carData.year}
                            onChange={handleChange}
                            min="1900"
                            max={new Date().getFullYear() + 1}
                            className={validationErrors.year ? 'error' : ''}
                            placeholder="e.g., 2020"
                        />
                        {validationErrors.year && <span className="error-message">{validationErrors.year}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="type">Type *</label>
                        <select
                            id="type"
                            name="type"
                            value={carData.type}
                            onChange={handleChange}
                            className={validationErrors.type ? 'error' : ''}
                        >
                            <option value="">Select Type</option>
                            <option value="Sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="Hatchback">Hatchback</option>
                            <option value="Luxury">Luxury</option>
                        </select>
                        {validationErrors.type && <span className="error-message">{validationErrors.type}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="transmission">Transmission *</label>
                        <select
                            id="transmission"
                            name="transmission"
                            value={carData.transmission}
                            onChange={handleChange}
                            className={validationErrors.transmission ? 'error' : ''}
                        >
                            <option value="">Select Transmission</option>
                            <option value="Automatic">Automatic</option>
                            <option value="Manual">Manual</option>
                        </select>
                        {validationErrors.transmission && <span className="error-message">{validationErrors.transmission}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="fuelType">Fuel Type *</label>
                        <select
                            id="fuelType"
                            name="fuelType"
                            value={carData.fuelType}
                            onChange={handleChange}
                            className={validationErrors.fuelType ? 'error' : ''}
                        >
                            <option value="">Select Fuel Type</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Electric">Electric</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                        {validationErrors.fuelType && <span className="error-message">{validationErrors.fuelType}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="seats">Number of Seats *</label>
                        <input
                            type="number"
                            id="seats"
                            name="seats"
                            value={carData.seats}
                            onChange={handleChange}
                            min="1"
                            max="10"
                            className={validationErrors.seats ? 'error' : ''}
                            placeholder="e.g., 5"
                        />
                        {validationErrors.seats && <span className="error-message">{validationErrors.seats}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="pricePerDay">Price per Day (₹) *</label>
                        <input
                            type="number"
                            id="pricePerDay"
                            name="pricePerDay"
                            value={carData.pricePerDay}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className={validationErrors.pricePerDay ? 'error' : ''}
                            placeholder="e.g., 1000"
                        />
                        {validationErrors.pricePerDay && <span className="error-message">{validationErrors.pricePerDay}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={carData.description}
                            onChange={handleChange}
                            className={validationErrors.description ? 'error' : ''}
                            placeholder="Describe your car..."
                            rows="4"
                        />
                        {validationErrors.description && <span className="error-message">{validationErrors.description}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="city">City *</label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={carData.city}
                            onChange={handleChange}
                            placeholder="Enter city"
                            required
                        />
                        {validationErrors.city && <span className="error-message">{validationErrors.city}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="state">State</label>
                        <input
                            type="text"
                            id="state"
                            name="state"
                            value={carData.state}
                            onChange={handleChange}
                            placeholder="Enter state"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <textarea
                            id="address"
                            name="address"
                            value={carData.address}
                            onChange={handleChange}
                            placeholder="Enter detailed address"
                            rows="2"
                        />
                    </div>

                    <div className="form-group">
                        <label>Features</label>
                        <div className="features-grid">
                            {Object.entries(carData.features).map(([feature, checked]) => (
                                <label key={feature} className="feature-checkbox">
                                    <input
                                        type="checkbox"
                                        name={feature}
                                        checked={checked}
                                        onChange={handleChange}
                                    />
                                    {feature.charAt(0).toUpperCase() + feature.slice(1)}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="images">Car Images</label>
                        <input
                            type="file"
                            id="images"
                            name="images"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="form-control"
                        />
                        {carData.images.length > 0 && (
                            <div className="image-preview">
                                {carData.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={URL.createObjectURL(image)}
                                        alt={`Preview ${index + 1}`}
                                        className="preview-image"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="submit-button" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default HostCar; 