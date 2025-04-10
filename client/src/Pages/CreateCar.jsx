import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import carAPI from '../services/carAPI';

const CreateCar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [type, setType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [seats, setSeats] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [features, setFeatures] = useState([]);
  const [images, setImages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      const requiredFields = {
        make,
        model,
        year,
        pricePerDay,
        type,
        transmission,
        fuelType,
        seats,
        description,
        city
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([field]) => field);

      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      // Validate features array
      if (!features || features.length === 0) {
        setError('Please select at least one feature');
        setLoading(false);
        return;
      }

      // Create form data
      const formData = new FormData();
      formData.append('make', make.trim());
      formData.append('model', model.trim());
      formData.append('year', year);
      formData.append('pricePerDay', pricePerDay);
      formData.append('type', type);
      formData.append('transmission', transmission);
      formData.append('fuelType', fuelType);
      formData.append('seats', seats);
      formData.append('description', description.trim());
      formData.append('features', JSON.stringify(features));
      formData.append('city', city.trim());
      formData.append('state', state.trim() || '');
      formData.append('address', address.trim() || '');

      // Append images
      if (images) {
        for (let i = 0; i < images.length; i++) {
          formData.append('images', images[i]);
        }
      }

      const response = await carAPI.createCar(formData);
      console.log('Car created successfully:', response);
      
      // Show success message and redirect
      setSuccess('Car listed successfully!');
      setTimeout(() => {
        navigate('/my-cars');
      }, 2000);

    } catch (error) {
      console.error('Error creating car:', error);
      setError(error.response?.data?.error || 'Failed to create car listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-car-container">
      <h2>List Your Car</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="create-car-form">
        <div className="form-group">
          <label htmlFor="make">Make *</label>
          <input
            type="text"
            id="make"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="e.g., Toyota"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="model">Model *</label>
          <input
            type="text"
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g., Camry"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="year">Year *</label>
          <input
            type="number"
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min="1900"
            max={new Date().getFullYear() + 1}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="pricePerDay">Price Per Day (USD) *</label>
          <input
            type="number"
            id="pricePerDay"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(e.target.value)}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Vehicle Type *</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">Select type</option>
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Luxury">Luxury</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="transmission">Transmission *</label>
          <select
            id="transmission"
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
            required
          >
            <option value="">Select transmission</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="fuelType">Fuel Type *</label>
          <select
            id="fuelType"
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            required
          >
            <option value="">Select fuel type</option>
            <option value="Gasoline">Gasoline</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="seats">Number of Seats *</label>
          <input
            type="number"
            id="seats"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            min="1"
            max="15"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="city">City *</label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., New York"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="state">State</label>
          <input
            type="text"
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g., NY"
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street address"
          />
        </div>

        <div className="form-group">
          <label htmlFor="features">Features *</label>
          <div className="features-grid">
            {[
              'Air Conditioning',
              'GPS',
              'Bluetooth',
              'Backup Camera',
              'Cruise Control',
              'Sunroof',
              'Leather Seats',
              'Heated Seats',
              'USB Port',
              'Apple CarPlay',
              'Android Auto',
              'Parking Sensors'
            ].map((feature) => (
              <label key={feature} className="feature-checkbox">
                <input
                  type="checkbox"
                  checked={features.includes(feature)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFeatures([...features, feature]);
                    } else {
                      setFeatures(features.filter(f => f !== feature));
                    }
                  }}
                />
                {feature}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your car..."
            required
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="images">Images</label>
          <input
            type="file"
            id="images"
            onChange={(e) => setImages(Array.from(e.target.files))}
            multiple
            accept="image/*"
          />
          <small>You can select multiple images</small>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCar; 