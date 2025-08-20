import crypto from "crypto";
import { supabase } from "../../utils/supabaseClient.js";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-admin-secret'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check admin secret
  if (req.headers["x-admin-secret"] !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { 
      plan = "pro", 
      max_accounts = Number(process.env.DEFAULT_MAX_ACCOUNTS) || 1, 
      days = Number(process.env.DEFAULT_LICENSE_DAYS) || 30 
    } = req.body || {};

    // Input validation
    if (!["pro", "basic", "enterprise"].includes(plan)) {
      return res.status(400).json({ error: "Invalid plan type" });
    }

    if (!Number.isInteger(max_accounts) || max_accounts < 1) {
      return res.status(400).json({ error: "Invalid max_accounts value" });
    }

    if (!Number.isInteger(days) || days < 1) {
      return res.status(400).json({ error: "Invalid days value" });
    }

    const license_key = crypto.randomBytes(16).toString("hex").toUpperCase();
    const expires_at = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();

    const { data, error } = await supabase
      .from("licenses")
      .insert({
        license_key,
        plan,
        max_accounts,
        expires_at,
        active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: "Failed to create license" });
    }

    res.status(200).json({
      license_key,
      plan,
      max_accounts,
      expires_at,
      message: "License created successfully"
    });
  } catch (err) {
    console.error('License creation error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
}
