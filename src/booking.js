import { supabase } from './supabase.js';

export async function createBooking(bookingData) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([bookingData])
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getPricingPlans() {
  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .order('price', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}
