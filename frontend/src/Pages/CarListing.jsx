import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { carAPI } from '../services/api';
import "../dist/styles.css";
import "../dist/carListing.css";

// Default image as a data URL for fallback
const defaultCarImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2YwZjBmMCIgLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KICA8cGF0aCBkPSJNNDAgNzBDNjAgNTAgOTAgNDAgMTIwIDUwQzE1MCA2MCAxODAgOTAgMTcwIDcwIiBzdHJva2U9IiM5OTkiIGZpbGw9Im5vbmUiIC8+Cjwvc3ZnPg==';

const CarListing = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        brand: '',
        type: '',
        minPrice: '',
        maxPrice: '',
        transmission: '',
        fuelType: ''
    });
    const [sortBy, setSortBy] = useState('price-asc');
    const [cityFilter, setCityFilter] = useState('');
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // Function to process car images
    const processCarImages = (carsData) => {
        return carsData.map(car => {
            console.log('Processing car for listing:', car);
            
            // Process images
            let processedImages = [];
            
            if (car.images && Array.isArray(car.images)) {
                processedImages = car.images.map(img => {
                    console.log('Processing image:', img);
                    
                    if (typeof img === 'object' && img.filename) {
                        const imageUrl = `http://localhost:3001/uploads/${img.filename}`;
                        console.log('Generated image URL from object:', imageUrl);
                        return imageUrl;
                    } else if (typeof img === 'string') {
                        if (img.startsWith('http')) {
                            console.log('Found absolute URL:', img);
                            return img;
                        } else {
                            const imageUrl = `http://localhost:3001/uploads/${img}`;
                            console.log('Generated image URL from string:', imageUrl);
                            return imageUrl;
                        }
                    }
                    return defaultCarImage;
                });
            } else if (car.imageUrl) {
                processedImages = [car.imageUrl];
            }
            
            if (processedImages.length === 0) {
                processedImages = [defaultCarImage];
            }
            
            return {
                ...car,
                processedImages
            };
        });
    };

    const fetchCars = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching all cars...');
            const response = await carAPI.getAllCars();
            console.log('Raw API response:', response);
            
            // Ensure we have an array of cars
            let carsData = Array.isArray(response) ? response : 
                         Array.isArray(response.data) ? response.data : [];
            
            console.log('Total cars in database:', carsData.length);
            console.log('Cars data before processing:', carsData);
            
            // Remove duplicates based on _id
            const uniqueCars = carsData.reduce((acc, car) => {
                if (!acc.find(c => c._id === car._id)) {
                    acc.push(car);
                } else {
                    console.log('Found duplicate car:', car._id, car.make, car.model);
                }
                return acc;
            }, []);
            
            console.log('Unique cars after deduplication:', uniqueCars.length);
            
            // Process car images
            const processedCars = processCarImages(uniqueCars);
            console.log('Processed cars with images:', processedCars);
            
            setCars(processedCars);
        } catch (err) {
            setError('Failed to fetch cars');
            console.error('Error fetching cars:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCars();
    }, [fetchCars]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const handleBookNow = (carId) => {
        if (!isAuthenticated) {
            navigate('/signin', { state: { from: `/booking/${carId}` } });
        } else {
            navigate(`/booking/${carId}`);
        }
    };

    // Update the filtering logic
    const filteredCars = Array.isArray(cars) ? cars
        .filter(car => {
            console.log('Filtering car:', car._id, car.make, car.model);
            if (!car) {
                console.log('Car is null or undefined, skipping');
                return false;
            }
            
            // Log each filter condition
            const matchesBrand = !filters.brand || (car.make && car.make.toLowerCase().includes(filters.brand.toLowerCase()));
            const matchesType = !filters.type || car.type === filters.type;
            const matchesTransmission = !filters.transmission || car.transmission === filters.transmission;
            const matchesFuelType = !filters.fuelType || car.fuelType === filters.fuelType;
            const matchesMinPrice = !filters.minPrice || (car.pricePerDay && car.pricePerDay >= Number(filters.minPrice));
            const matchesMaxPrice = !filters.maxPrice || (car.pricePerDay && car.pricePerDay <= Number(filters.maxPrice));
            const matchesCity = !cityFilter || (car.city && car.city.toLowerCase().includes(cityFilter.toLowerCase()));
            
            console.log(`Car ${car._id} filter results:`, {
                matchesBrand,
                matchesType,
                matchesTransmission,
                matchesFuelType,
                matchesMinPrice,
                matchesMaxPrice,
                matchesCity,
                brand: car.make,
                type: car.type,
                transmission: car.transmission,
                fuelType: car.fuelType,
                price: car.pricePerDay,
                city: car.city
            });
            
            // Only apply filters if they have values
            const shouldFilter = filters.brand || filters.type || filters.transmission || 
                               filters.fuelType || filters.minPrice || filters.maxPrice || cityFilter;
            
            if (!shouldFilter) {
                return true; // Show all cars if no filters are applied
            }
            
            return matchesBrand && matchesType && matchesTransmission && 
                   matchesFuelType && matchesMinPrice && matchesMaxPrice && matchesCity;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-asc':
                    return a.pricePerDay - b.pricePerDay;
                case 'price-desc':
                    return b.pricePerDay - a.pricePerDay;
                case 'year-desc':
                    return b.year - a.year;
                case 'year-asc':
                    return a.year - b.year;
                default:
                    return 0;
            }
        }) : [];

    console.log('Total cars after filtering:', filteredCars.length);
    console.log('Final filtered cars:', filteredCars.map(car => ({
        id: car._id,
        make: car.make,
        model: car.model,
        type: car.type,
        price: car.pricePerDay,
        city: car.city,
        fuelType: car.fuelType,
        transmission: car.transmission
    })));

    if (loading) {
        return (
            <div className="main-content">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading cars...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="main-content">
                <div className="error-container">
                    <p>{error}</p>
                    <button onClick={fetchCars} className="retry-button">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <div className="car-listing-container">
                <div className="car-listing-header">
                    <h1>Our Car Collection</h1>
                    <p>Discover our wide range of vehicles for your perfect journey</p>
                </div>

                <div className="car-listing-content">
                    <div className="filters-section">
                        <h2>Filters</h2>
                        <div className="filter-group">
                            <label htmlFor="brand">Brand</label>
                            <input
                                type="text"
                                id="brand"
                                name="brand"
                                value={filters.brand}
                                onChange={handleFilterChange}
                                placeholder="Enter brand"
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="type">Type</label>
                            <select
                                id="type"
                                name="type"
                                value={filters.type}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Types</option>
                                <option value="Sedan">Sedan</option>
                                <option value="SUV">SUV</option>
                                <option value="Luxury">Luxury</option>
                                <option value="Sports">Sports</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="minPrice">Min Price</label>
                            <input
                                type="number"
                                id="minPrice"
                                name="minPrice"
                                value={filters.minPrice}
                                onChange={handleFilterChange}
                                placeholder="Min price"
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="maxPrice">Max Price</label>
                            <input
                                type="number"
                                id="maxPrice"
                                name="maxPrice"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                                placeholder="Max price"
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="transmission">Transmission</label>
                            <select
                                id="transmission"
                                name="transmission"
                                value={filters.transmission}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Transmissions</option>
                                <option value="Automatic">Automatic</option>
                                <option value="Manual">Manual</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="fuelType">Fuel Type</label>
                            <select
                                id="fuelType"
                                name="fuelType"
                                value={filters.fuelType}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Fuel Types</option>
                                <option value="Petrol">Petrol</option>
                                <option value="Diesel">Diesel</option>
                                <option value="Electric">Electric</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="city">City</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                placeholder="Filter by city"
                            />
                        </div>
                    </div>

                    <div className="cars-section">
                        <div className="cars-header">
                            <h2>Available Cars ({filteredCars.length})</h2>
                            <div className="sort-container">
                                <label htmlFor="sort">Sort by:</label>
                                <select id="sort" value={sortBy} onChange={handleSortChange}>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="year-desc">Year: Newest First</option>
                                    <option value="year-asc">Year: Oldest First</option>
                                </select>
                            </div>
                        </div>

                        <div className="cars-grid">
                            {filteredCars.map(car => {
                                const imageUrl = car.processedImages?.[0] || defaultCarImage;
                                console.log(`Car ${car._id}: Using image ${imageUrl}`);
                                
                                return (
                                    <div key={car._id} className="car-card">
                                        <div className="car-image">
                                            <img 
                                                src={imageUrl} 
                                                alt={`${car.make} ${car.model}`}
                                                onError={(e) => {
                                                    console.error('Image load error:', car._id, imageUrl);
                                                    e.target.src = defaultCarImage;
                                                }}
                                            />
                                            <div className="car-badge">{car.type}</div>
                                        </div>
                                        <div className="car-info">
                                            <h3>{car.make} {car.model}</h3>
                                            <div className="car-specs">
                                                <span><i className="fas fa-car"></i> {car.type}</span>
                                                <span><i className="fas fa-cog"></i> {car.transmission}</span>
                                                <span><i className="fas fa-gas-pump"></i> {car.fuelType}</span>
                                                <span><i className="fas fa-users"></i> {car.seats} seats</span>
                                                <div className="location-info">
                                                    <span><i className="fas fa-map-marker-alt"></i> Location:</span>
                                                    <div className="location-details">
                                                        {car.address && <span>{car.address}</span>}
                                                        {car.city && <span>{car.city}</span>}
                                                        {car.state && <span>{car.state}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="car-price">
                                                <span className="price">₹{car.pricePerDay}</span>
                                                <span className="per-day">/day</span>
                                            </div>
                                            <button 
                                                className="book-now-button"
                                                onClick={() => handleBookNow(car._id)}
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredCars.length === 0 && (
                            <div className="no-results">
                                <i className="fas fa-search"></i>
                                <p>No cars found matching your criteria</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarListing; 