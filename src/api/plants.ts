import { supabase } from '../lib/supabase';

export async function getHomeData(userId: string) {
  const { data, error } = await supabase.rpc('get_home', { p_user_id: userId });
  if (error) throw error;
  return data;
}

export async function getPlantById(id: string) {
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) throw new Error('Bitki bulunamadı!');
  return data;
}