
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CheckoutWrapper from './CheckoutWrapper';

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const clientSecret = searchParams.get('clientSecret');

  return <CheckoutWrapper clientSecret={clientSecret} bookingId={bookingId} />;
}
