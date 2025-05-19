
import dynamic from 'next/dynamic';

// Dynamically import your client component
const CheckoutClient = dynamic(() => import('./CheckoutClient'));

export default function CheckoutPage() {
  return <CheckoutClient />;
}

