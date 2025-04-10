import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { bookingAPI } from '../services/api';
import '../dist/stripePayment.css';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PaymentForm = ({ bookingId, amount, car, dates, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    let timer;
    if (success && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [success, countdown]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const response = await bookingAPI.createPaymentIntent(bookingId);
      const { clientSecret } = response;

      // Confirm the payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: 'Car Rental Customer',
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Payment successful
      if (paymentIntent.status === 'succeeded') {
        // Update booking status
        await bookingAPI.confirmPayment(bookingId, paymentIntent.id);
        setSuccess(true);
        // Wait for 10 seconds before calling onSuccess to show the success message
        setTimeout(() => {
          onSuccess(paymentIntent);
        }, 10000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'An error occurred during payment processing.');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="payment-success">
        <div className="success-icon">✓</div>
        <h2>Payment Successful!</h2>
        <p>Your booking has been confirmed.</p>
        <p>You will be redirected to your bookings page in {countdown} seconds...</p>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-summary">
        <h2>Payment Summary</h2>
        <div className="car-details">
          <img 
            src={car.images?.[0]?.filename ? `http://localhost:3001/uploads/${car.images[0].filename}` : '/default-car.jpg'} 
            alt={`${car.make} ${car.model}`} 
            className="car-image"
          />
          <div className="car-info">
            <h3>{car.make} {car.model}</h3>
            <p>Start Date: {new Date(dates.start).toLocaleDateString()}</p>
            <p>End Date: {new Date(dates.end).toLocaleDateString()}</p>
            <p className="total-amount">Total Amount: ₹{amount}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="card-element-container">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="button-container">
          <button 
            type="button" 
            onClick={onCancel} 
            className="cancel-button"
            disabled={processing}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="pay-button"
            disabled={!stripe || processing}
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </form>
    </div>
  );
};

const StripePayment = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default StripePayment; 