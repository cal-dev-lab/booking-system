
'use client';

import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useState } from 'react';

export default function CheckoutForm({ bookingId, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success?bookingId=${bookingId}&payment_intent_client_secret=${clientSecret}`,
      },
      redirect: 'if_required',
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else if (paymentIntent?.status === 'succeeded') {
      window.location.href = `/success?bookingId=${bookingId}&payment_intent_client_secret=${clientSecret}`;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="bg-blue-600 text-white px-4 py-2 mt-4 rounded hover:bg-blue-700"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      <button
        onClick={() => window.location.href = '/book'}
        className="text-red-500 underline"
      >
        Cancel Booking
      </button>
    </form>
  );
}

