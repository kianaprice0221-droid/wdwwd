export async function initiatePayment(planId, customerEmail) {
  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  if (!stripePublishableKey) {
    throw new Error('Stripe is not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY to your environment variables.');
  }

  return {
    success: false,
    message: 'Stripe integration requires configuration'
  };
}

export function isStripeConfigured() {
  return !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
}
