"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // new next/navigation router hook
import { supabase } from "@/lib/supabaseClient";

export default function useAdminBookings() {
  const router = useRouter();

  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkAdminAndFetch() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error || profile?.role !== "admin") {
          router.push("/not-authorized");
          return;
        }

        const { data: bookingsData, error: bookingsError } = await supabase
          .from("bookings")
          .select(`
            *,
            service:service_id (
              id,
              name
            )
          `)
          .order("booking_date", { ascending: false });

        if (bookingsError) {
          setError("Error fetching bookings");
          console.error("Bookings error:", bookingsError);
        } else {
          setBookings(bookingsData);
        }
      } catch (e) {
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndFetch();
  }, [router]);

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) {
      alert('Error deleting booking: ' + error.message);
    } else {
      setBookings((prev) => prev.filter((b) => b.id !== id));
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Remove the jwtToken cookie by setting it with an expired date
    document.cookie = `jwtToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    router.push('/login');  
  };

  return { bookings, loading, error, handleDelete, handleLogout };
}

