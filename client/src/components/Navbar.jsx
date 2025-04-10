import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "../dist/navbar.css";
import Logo from "../images/logo/logo.png";

function Navbar() {
    const [nav, setNav] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const openNav = () => {
        setNav(!nav);
    };

    const handleLogoClick = () => {
        window.scrollTo(0, 0);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav>
            {/* mobile */}
            <div className={`mobile-navbar ${nav ? "open-nav" : ""}`}>
                <div onClick={openNav} className="mobile-navbar__close">
                    <i className="fa-solid fa-xmark"></i>
                </div>
                <ul className="mobile-navbar__links">
                    <li>
                        <Link onClick={openNav} to="/">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link onClick={openNav} to="/cars">
                            Cars
                        </Link>
                    </li>
                    <li>
                        <Link onClick={openNav} to="/booking">
                            Book Now
                        </Link>
                    </li>
                    <li>
                        <Link onClick={openNav} to="/about">
                            About
                        </Link>
                    </li>
                    <li>
                        <Link onClick={openNav} to="/contact">
                            Contact
                        </Link>
                    </li>
                    {user ? (
                        <>
                            {isAdmin() && (
                                <li>
                                    <Link onClick={openNav} to="/admin" className="navbar__buttons__admin">
                                        Admin Panel
                                    </Link>
                                </li>
                            )}
                            <li>
                                <Link to="/host-car" className="navbar__buttons__host-car">
                                    Host Your Car
                                </Link>
                            </li>
                            <li>
                                <Link to="/my-listings" className="navbar__buttons__my-listings">
                                    My Listings
                                </Link>
                            </li>
                            <li>
                                <Link to="/my-bookings" className="navbar__buttons__my-bookings">
                                    My Bookings
                                </Link>
                            </li>
                            <li>
                                <span className="user-email">{user.email}</span>
                            </li>
                            <li>
                                <button onClick={handleLogout} className="navbar__buttons__logout">
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link onClick={openNav} to="/signin" className="navbar__buttons__sign-in">
                                    Sign In
                                </Link>
                            </li>
                            <li>
                                <Link onClick={openNav} to="/register" className="navbar__buttons__register">
                                    Register
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>

            {/* desktop */}
            <div className="navbar">
                <div className="navbar__img">
                    <Link to="/" onClick={handleLogoClick}>
                        <img src={Logo} alt="logo-img" />
                    </Link>
                </div>
                <ul className="navbar__links">
                    <li>
                        <Link className="home-link" to="/">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link className="cars-link" to="/cars">
                            Cars
                        </Link>
                    </li>
                    <li>
                        <Link className="about-link" to="/about">
                            About
                        </Link>
                    </li>
                    <li>
                        <Link className="contact-link" to="/contact">
                            Contact
                        </Link>
                    </li>
                </ul>
                <div className="navbar__buttons">
                    {user ? (
                        <>
                            {isAdmin() && (
                                <Link to="/admin" className="navbar__buttons__admin">
                                    Admin Panel
                                </Link>
                            )}
                            <Link to="/host-car" className="navbar__buttons__host-car">
                                Host Your Car
                            </Link>
                            <Link to="/my-listings" className="navbar__buttons__my-listings">
                                My Listings
                            </Link>
                            <Link to="/my-bookings" className="navbar__buttons__my-bookings">
                                My Bookings
                            </Link>
                            <span className="user-email">{user.email}</span>
                            <button onClick={handleLogout} className="navbar__buttons__logout">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link className="navbar__buttons__sign-in" to="/signin">
                                Sign In
                            </Link>
                            <Link className="navbar__buttons__register" to="/register">
                                Register
                            </Link>
                        </>
                    )}
                </div>

                {/* mobile */}
                <div
                    className="mobile-hamb"
                    onClick={openNav}
                    aria-label="Toggle mobile navigation"
                >
                    <i className="fa-solid fa-bars"></i>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

