import "./dist/styles.css";
import About from "./Pages/About";
import Home from "./Pages/Home";
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Contact from "./Pages/Contact";
import Register from "./Pages/Register";
import SignIn from './Pages/Sign_in';
import { AuthProvider } from './context/AuthContext';
import CarListing from './Pages/CarListing';
import CarDetails from './Pages/CarDetails';
import Footer from './components/Footer';
import HostCar from './Pages/HostCar';
import MyListings from './Pages/MyListings';
import ProtectedRoute from './components/ProtectedRoute';
import Booking from './Pages/Booking';
import MyBookings from './Pages/MyBookings';
import Admin from './Pages/Admin';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cars" element={<CarListing />} />
              <Route path="/cars/:id" element={<CarDetails />} />
              <Route 
                path="/booking/:id" 
                element={
                  <ProtectedRoute>
                    <Booking />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/booking" 
                element={<Navigate to="/cars" replace />} 
              />
              <Route 
                path="/my-listings" 
                element={
                  <ProtectedRoute>
                    <MyListings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/host-car" 
                element={
                  <ProtectedRoute>
                    <HostCar />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-bookings" 
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
