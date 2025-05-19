
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const clientSecret = searchParams.get('payment_intent_client_secret');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function verifyPayment() {
      if (!clientSecret || !bookingId) {
        setError('Missing payment info.');
        setLoading(false);
        return;
      }

      // Extract PaymentIntent ID from client secret
      const paymentIntentId = clientSecret.split('_secret_')[0];

      try {
        // Call backend API to get payment intent status
        const res = await fetch('/api/stripe-payment-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          setError(data.error || 'Failed to verify payment');
          setLoading(false);
          return;
        }

        setStatus(data.status);

        if (data.status === 'succeeded') {
          // Update booking status in Supabase
          const { error: supaError } = await supabase
            .from('bookings')
            .update({ status: 'PAID' })
            .eq('id', bookingId);

          if (supaError) {
            setError('Failed to update booking status');
          }
        } else {
          setError(`Payment status: ${data.status}`);
        }
      } catch (err) {
        setError('Unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [clientSecret, bookingId]);

  if (loading) return <p>Verifying payment...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <p>Status: {status}</p>
      <h1 className="text-2xl font-bold">Payment Successful 🎉</h1>
      <p className="mt-2">Thank you for your booking. We’ll be in touch soon!</p>
    </div>
  );
}

