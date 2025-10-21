# Stripe Payment Integration Setup

This project includes a booking and payment system ready for Stripe integration.

## Setup Instructions

To enable Stripe payments on your website:

1. **Create a Stripe Account**
   - Visit [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
   - Complete the registration process

2. **Get Your Stripe Keys**
   - Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
   - Navigate to Developers > API keys
   - Copy your Publishable key

3. **Configure Environment Variables**
   - Add your Stripe key to the `.env` file:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

4. **Set Up Stripe Products**
   - Create products in your Stripe Dashboard matching your pricing plans
   - Update the `stripe_price_id` field in the `pricing_plans` table with your Stripe Price IDs

## Current Features

- **Pricing Plans**: Three service packages stored in Supabase
- **Booking System**: Customers can schedule consultations directly through the website
- **Database Integration**: All bookings are saved to Supabase with payment status tracking
- **Email Notifications**: Contact email updated to kianprice210@gmail.com

## How It Works

1. Customers browse your pricing plans on the website
2. They can click "Choose Plan" to jump to the booking form
3. The booking form captures their information and preferred service package
4. Bookings are saved to the database for your review
5. When Stripe is configured, payments can be processed directly

## Need Help?

For detailed Stripe integration guidance, visit: https://bolt.new/setup/stripe
