import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { carAPI } from '../services/api';
import '../dist/styles.css';

// Default image as a data URL for fallback
const defaultCarImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2YwZjBmMCIgLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KICA8cGF0aCBkPSJNNDAgNzBDNjAgNTAgOTAgNDAgMTIwIDUwQzE1MCA2MCAxODAgOTAgMTcwIDcwIiBzdHJva2U9IiM5OTkiIGZpbGw9Im5vbmUiIC8+Cjwvc3ZnPg==';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [processedImages, setProcessedImages] = useState([]);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await carAPI.getCarById(id);
        console.log('Car details response:', response);
        
        // Process car data and images
        const carData = response.data || response;
        
        // Process images
        let images = [];
        if (carData.images && Array.isArray(carData.images)) {
          images = carData.images.map(img => {
            if (typeof img === 'object' && img.filename) {
              return `http://localhost:3001/uploads/${img.filename}`;
            } else if (typeof img === 'string') {
              return img.startsWith('http') ? img : `http://localhost:3001/uploads/${img}`;
            }
            return defaultCarImage;
          });
        } else if (carData.imageUrl) {
          images = [carData.imageUrl];
        }
        
        if (images.length === 0) {
          images = [defaultCarImage];
        }
        
        setProcessedImages(images);
        setCar(carData);
      } catch (err) {
        console.error('Error fetching car details:', err);
        setError(err.message || 'Failed to fetch car details');
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  const nextImage = () => {
    if (processedImages.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === processedImages.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (processedImages.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? processedImages.length - 1 : prevIndex - 1
      );
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!car) {
    return <div className="error">Car not found</div>;
  }

  return (
    <div className="car-details-container">
      <div className="car-details-content">
        <div className="car-image-container">
          <div className="car-image">
            <img 
              src={processedImages[currentImageIndex]} 
              alt={`${car.make} ${car.model}`}
              onError={(e) => {
                console.error('Image load error');
                e.target.src = defaultCarImage;
              }}
            />
            
            {processedImages.length > 1 && (
              <div className="image-navigation">
                <button onClick={prevImage} className="nav-button prev">
                  &lt;
                </button>
                <button onClick={nextImage} className="nav-button next">
                  &gt;
                </button>
                <div className="image-indicators">
                  {processedImages.map((_, index) => (
                    <span 
                      key={index} 
                      className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="car-info">
          <h1>{car.make} {car.model}</h1>
          <p className="year">{car.year}</p>
          
          <div className="price-section">
            <h2>₹{car.pricePerDay}/day</h2>
            <div className="car-actions">
              <button 
                className="book-now-btn"
                onClick={() => navigate(`/booking/${id}`)}
              >
                Book Now
              </button>
            </div>
          </div>

          <div className="specs">
            <div className="spec-item">
              <span className="label">Type:</span>
              <span className="value">{car.type}</span>
            </div>
            <div className="spec-item">
              <span className="label">Transmission:</span>
              <span className="value">{car.transmission}</span>
            </div>
            <div className="spec-item">
              <span className="label">Fuel Type:</span>
              <span className="value">{car.fuelType}</span>
            </div>
            <div className="spec-item">
              <span className="label">Seats:</span>
              <span className="value">{car.seats}</span>
            </div>
          </div>

          <div className="description">
            <h3>Description</h3>
            <p>{car.description}</p>
          </div>

          <div className="features">
            <h3>Features</h3>
            <ul>
              {car.features && car.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails; 