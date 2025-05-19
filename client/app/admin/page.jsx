'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import useAdminBookings from '@/hooks/useAdminBookings';

export default function AdminPage() {
  const { bookings, loading, error, handleDelete, handleLogout } = useAdminBookings();

  if (loading) return <p>Loading admin dashboard...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!bookings || bookings?.length == 0) return <p>No bookings found...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={handleLogout}>Log out</button>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">Time</th>
              <th className="border p-2">Service</th>
              <th className="border p-2">Customer</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td className="border p-2">
                  {b?.booking_date ? new Date(b.booking_date).toLocaleDateString() : 'No date'}
                </td>
                <td className="border p-2">{b?.booking_time}</td>
                <td className="border p-2">{b.service.name}</td>
                <td className="border p-2">{b.customer_name}</td>
                <td className="border p-2">{b.status}</td>
                <td className="border p-2 space-x-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => alert(`Edit booking ${b.id} - implement form/modal`)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(b.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}

