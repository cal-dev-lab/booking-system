"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function BookingPage() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    time: '',
    name: '',
    email: ''
  });

  const [isSlotAvailable, setIsSlotAvailable] = useState(true);

useEffect(() => {
  async function checkAvailability() {
    if (!formData.serviceId || !formData.date || !formData.time) {
      setIsSlotAvailable(true);
      return;
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('service_id', formData.serviceId)
      .eq('booking_date', formData.date)
      .eq('booking_time', formData.time);

    setIsSlotAvailable(data.length === 0);
  }

  checkAvailability();
}, [formData.serviceId, formData.date, formData.time]);


  useEffect(() => {
    async function loadServices() {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching services:', error);
      } else {
        setServices(data);
      }
    }
    loadServices();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  
const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("Submitting form data: ", formData)

  // Call backend API to create booking and payment intent
  const response = await fetch('/api/create-booking-and-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  const result = await response.json();

  if (response.ok) {
    // Redirect to checkout page with booking ID or PaymentIntent client secret
    window.location.href = `/checkout?bookingId=${result.bookingId}&clientSecret=${result.clientSecret}`;
  } else {
    alert('Booking error: ' + result.error);
  }
};

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Book a Service</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Service</label>
          <select
            name="serviceId"
            value={formData.serviceId}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} (£{service.price})
              </option>
            ))}
          </select>
        </div>

        {/* Date, Time, Name, Email inputs unchanged */}

        <div>
          <label className="block font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Time</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <button
          type="submit"
          className="disabled:bg-red-500 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={!isSlotAvailable}
        >
          Book Now
        </button>
      </form>
    </div>
  );
}
