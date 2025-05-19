
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { serviceId, date, time, name, email } = body;

    if (!serviceId || !date || !time || !name || !email) {
      return NextResponse.json({ error: 'Missing required booking data' }, { status: 400 });
    }

    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert([
        {
          service_id: serviceId,
          booking_date: date,
          booking_time: time,
          customer_name: name,
          customer_email: email,
          status: 'pending_payment',
        },
      ])
    .select();

    if (bookingError) {
      console.error('Booking insert error:', bookingError);
      return NextResponse.json({ error: bookingError.message || 'Error saving booking' }, { status: 500 });
    }

    const booking = bookingData[0];

    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 400 });
    }

    const amount = service.price * 100;

    const existingCustomers = await stripe.customers.list({ email, limit: 1 });

    const customer = existingCustomers.data.length
      ? existingCustomers.data[0]
      : await stripe.customers.create({ name, email });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'gbp',
      customer: customer.id,
      receipt_email: email,
      description: `Booking for ${service.name}`,
      metadata: {
        booking_id: booking.id,
      },
      automatic_payment_methods: { enabled: true },
    });

    await supabase
      .from('bookings')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', booking.id);

    return NextResponse.json({
      bookingId: booking.id,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

