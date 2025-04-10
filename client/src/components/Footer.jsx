import React from 'react';
import { Link } from 'react-router-dom';
import "../dist/footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>About Us</h3>
                    <p>Your trusted partner in car rentals. We provide quality vehicles and exceptional service to make your journey comfortable and memorable.</p>
                    <div className="social-links">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                            <i className="fab fa-facebook"></i>
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                            <i className="fab fa-twitter"></i>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
                            <i className="fab fa-linkedin"></i>
                        </a>
                    </div>
                </div>

                <div className="footer-section">
                    <h3>Quick Links</h3>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/cars">Our Cars</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Services</h3>
                    <ul className="footer-links">
                        <li><Link to="/cars">Car Rental</Link></li>
                        <li><Link to="/cars">Luxury Cars</Link></li>
                        <li><Link to="/cars">SUV Rental</Link></li>
                        <li><Link to="/cars">Long Term Rental</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Contact Info</h3>
                    <ul className="contact-info">
                        <li>
                            <i className="fas fa-map-marker-alt"></i>
                            <span>123 Car Street, Auto City, AC 12345</span>
                        </li>
                        <li>
                            <i className="fas fa-phone"></i>
                            <span>+1 234 567 8900</span>
                        </li>
                        <li>
                            <i className="fas fa-envelope"></i>
                            <span>info@carrental.com</span>
                        </li>
                        <li>
                            <i className="fas fa-clock"></i>
                            <span>Mon - Fri: 9:00 AM - 6:00 PM</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; 2024 Car Rental. All rights reserved.</p>
                <div className="footer-bottom-links">
                    <Link to="/privacy">Privacy Policy</Link>
                    <Link to="/terms">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
