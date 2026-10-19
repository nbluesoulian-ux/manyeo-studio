module.exports = (req, res) => {
  // Set CORS and Cache-Control headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Read environment variables set in Vercel project dashboard, with default fallbacks
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kxlmdxvmcicbgengytoo.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_G_qnPRoc5FAomnq6vVKIGA_bKZx6q1V';

  return res.status(200).json({
    supabaseUrl,
    supabaseKey,
    environment: process.env.VERCEL_ENV || 'development'
  });
};
