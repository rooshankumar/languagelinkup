
import { Router } from 'express';
import { supabase } from '../lib/supabaseClient';

const router = Router();

// Auth routes
router.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// User routes
router.get('/users/profile', async (req, res) => {
  const { user } = await supabase.auth.getUser();
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user?.id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Onboarding routes
router.post('/users/onboarding', async (req, res) => {
  const { user } = await supabase.auth.getUser();
  const profileData = req.body;
  
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({ 
        id: user?.id,
        ...profileData,
        onboarding_completed: true 
      });
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
