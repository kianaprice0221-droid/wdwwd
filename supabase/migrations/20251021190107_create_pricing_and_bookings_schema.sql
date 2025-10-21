/*
  # Create Pricing and Booking Schema

  ## Overview
  This migration creates tables for managing pricing plans and customer bookings
  for the portfolio website's payment and scheduling system.

  ## New Tables
  
  ### `pricing_plans`
  - `id` (uuid, primary key) - Unique identifier for each pricing plan
  - `name` (text) - Name of the pricing plan (e.g., "Basic Website", "E-Commerce Platform")
  - `description` (text) - Detailed description of what's included
  - `price` (numeric) - Price in dollars
  - `features` (jsonb) - Array of features included in the plan
  - `is_popular` (boolean) - Flag to highlight popular plans
  - `stripe_price_id` (text, nullable) - Stripe Price ID for payment processing
  - `created_at` (timestamptz) - Timestamp when plan was created
  - `updated_at` (timestamptz) - Timestamp when plan was last updated

  ### `bookings`
  - `id` (uuid, primary key) - Unique identifier for each booking
  - `customer_name` (text) - Name of the customer
  - `customer_email` (text) - Email address of the customer
  - `customer_phone` (text, nullable) - Phone number of the customer
  - `plan_id` (uuid, nullable) - Reference to pricing_plans table
  - `booking_date` (date) - Preferred date for consultation/start
  - `booking_time` (text) - Preferred time slot
  - `message` (text, nullable) - Additional message or requirements
  - `status` (text) - Booking status: 'pending', 'confirmed', 'completed', 'cancelled'
  - `payment_status` (text) - Payment status: 'unpaid', 'paid', 'refunded'
  - `stripe_payment_intent_id` (text, nullable) - Stripe Payment Intent ID
  - `created_at` (timestamptz) - Timestamp when booking was created
  - `updated_at` (timestamptz) - Timestamp when booking was last updated

  ## Security
  - Enable RLS on all tables
  - Allow public read access to pricing_plans (for display)
  - Restrict bookings to authenticated users or allow anonymous creates for public booking
  - Admin access required for updates
*/

-- Create pricing_plans table
CREATE TABLE IF NOT EXISTS pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  features jsonb DEFAULT '[]'::jsonb,
  is_popular boolean DEFAULT false,
  stripe_price_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  plan_id uuid REFERENCES pricing_plans(id) ON DELETE SET NULL,
  booking_date date NOT NULL,
  booking_time text NOT NULL,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status text DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  stripe_payment_intent_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Pricing Plans Policies (Public Read)
CREATE POLICY "Anyone can view pricing plans"
  ON pricing_plans FOR SELECT
  USING (true);

-- Bookings Policies (Allow anonymous creates for public booking form)
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (customer_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_is_popular ON pricing_plans(is_popular);

-- Insert sample pricing plans
INSERT INTO pricing_plans (name, description, price, features, is_popular) VALUES
  (
    'Basic Website',
    'Perfect for personal portfolios and small businesses',
    999.00,
    '["Responsive Design", "Up to 5 Pages", "Contact Form", "SEO Optimization", "2 Revisions", "30-Day Support"]'::jsonb,
    false
  ),
  (
    'Professional Package',
    'Ideal for growing businesses and startups',
    2499.00,
    '["Everything in Basic", "Up to 15 Pages", "CMS Integration", "Advanced Animations", "API Integration", "5 Revisions", "90-Day Support", "Performance Optimization"]'::jsonb,
    true
  ),
  (
    'E-Commerce Solution',
    'Complete online store with payment processing',
    4999.00,
    '["Everything in Professional", "Unlimited Pages", "Payment Gateway Setup", "Product Management", "Order Tracking", "Customer Accounts", "10 Revisions", "6-Month Support", "Analytics Dashboard"]'::jsonb,
    false
  )
ON CONFLICT DO NOTHING;
