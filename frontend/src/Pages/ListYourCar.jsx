import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { carAPI } from '../services/api';
import "../dist/listYourCar.css";

const ListYourCar = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [carData, setCarData] = useState({
        make: '',
        model: '',
        year: '',
        type: '',
        transmission: '',
        fuelType: '',
        seats: '',
        pricePerDay: '',
        description: '',
        features: [],
        location: '',
        images: []
    });
    const [selectedImages, setSelectedImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCarData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFeatureChange = (e) => {
        const { value, checked } = e.target;
        setCarData(prev => ({
            ...prev,
            features: checked 
                ? [...prev.features, value]
                : prev.features.filter(feature => feature !== value)
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages(files);
        
        // Create preview URLs
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Create FormData object for multipart/form-data
            const formData = new FormData();
            
            // Append car data
            Object.keys(carData).forEach(key => {
                if (key === 'features') {
                    formData.append(key, JSON.stringify(carData[key]));
                } else if (key !== 'images') {
                    formData.append(key, carData[key]);
                }
            });

            // Append images
            selectedImages.forEach((image, index) => {
                formData.append('images', image);
            });

            // Submit the form data
            await carAPI.createCar(formData);
            
            // Redirect to cars listing page
            navigate('/cars');
        } catch (err) {
            setError('Failed to list your car. Please try again.');
            console.error('Error listing car:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="list-car-container">
            <div className="list-car-content">
                <h1>List Your Car</h1>
                <p>Share your car with others and earn money</p>

                <form onSubmit={handleSubmit} className="list-car-form">
                    <div className="form-section">
                        <h2>Basic Information</h2>
                        <div className="form-group">
                            <label>Make</label>
                            <input
                                type="text"
                                name="make"
                                value={carData.make}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Model</label>
                            <input
                                type="text"
                                name="model"
                                value={carData.model}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Year</label>
                            <input
                                type="number"
                                name="year"
                                value={carData.year}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <select name="type" value={carData.type} onChange={handleInputChange} required>
                                <option value="">Select Type</option>
                                <option value="Sedan">Sedan</option>
                                <option value="SUV">SUV</option>
                                <option value="Luxury">Luxury</option>
                                <option value="Sports">Sports</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Specifications</h2>
                        <div className="form-group">
                            <label>Transmission</label>
                            <select name="transmission" value={carData.transmission} onChange={handleInputChange} required>
                                <option value="">Select Transmission</option>
                                <option value="Automatic">Automatic</option>
                                <option value="Manual">Manual</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Fuel Type</label>
                            <select name="fuelType" value={carData.fuelType} onChange={handleInputChange} required>
                                <option value="">Select Fuel Type</option>
                                <option value="Petrol">Petrol</option>
                                <option value="Diesel">Diesel</option>
                                <option value="Electric">Electric</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Number of Seats</label>
                            <input
                                type="number"
                                name="seats"
                                value={carData.seats}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Price per Day ($)</label>
                            <input
                                type="number"
                                name="pricePerDay"
                                value={carData.pricePerDay}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Features</h2>
                        <div className="features-grid">
                            {['Air Conditioning', 'GPS', 'Bluetooth', 'USB Port', 'Backup Camera', 'Parking Sensors', 'Sunroof', 'Leather Seats'].map(feature => (
                                <label key={feature} className="feature-checkbox">
                                    <input
                                        type="checkbox"
                                        value={feature}
                                        checked={carData.features.includes(feature)}
                                        onChange={handleFeatureChange}
                                    />
                                    {feature}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Location & Description</h2>
                        <div className="form-group">
                            <label>Location</label>
                            <input
                                type="text"
                                name="location"
                                value={carData.location}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={carData.description}
                                onChange={handleInputChange}
                                required
                                rows="4"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Car Images</h2>
                        <div className="form-group">
                            <label>Upload Images (Max 5)</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                required
                            />
                        </div>
                        {previewUrls.length > 0 && (
                            <div className="image-preview">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="preview-item">
                                        <img src={url} alt={`Preview ${index + 1}`} />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedImages(prev => prev.filter((_, i) => i !== index));
                                                setPreviewUrls(prev => prev.filter((_, i) => i !== index));
                                            }}
                                            className="remove-image"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Listing Car...' : 'List Your Car'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ListYourCar; 