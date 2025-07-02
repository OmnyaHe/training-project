import express from 'express';
import supabase from '../supabase.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data: place, error: placeError } = await supabase
      .from('المكان')
      .select('*')
      .eq('معرف_المكان', id)
      .single();

    if (placeError || !place) {
      return res.status(404).json({ error: 'المكان غير موجود' });
    }

    const { data: images } = await supabase
      .from('صورة_المكان')
      .select('رابط_الصورة')
      .eq('معرف_المكان', id);

    const { data: poems } = await supabase
      .from('القصيدة')
      .select('معرف_القصيدة, النص_الشهري')
      .eq('معرف_المكان', id);

    res.json({ ...place, الصور: images, القصائد: poems });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ في السيرفر', details: err.message });
  }
});

export default router;
