import express from 'express';
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const router = express.Router();

// Verify required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  if (req.headers["x-admin-secret"] !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// POST /api/issue
router.post('/', authenticateAdmin, async (req, res) => {
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

    res.json({
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
});

// GET /api/issue/list - List all licenses (admin only)
router.get('/list', authenticateAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("licenses")
      .select(`
        *,
        activations (
          id,
          account,
          server,
          last_validated
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ licenses: data });
  } catch (err) {
    console.error('Error fetching licenses:', err);
    res.status(500).json({ error: "Failed to fetch licenses" });
  }
});

// PATCH /api/issue/:key - Update license status
router.patch('/:key', authenticateAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({ error: "active must be a boolean" });
    }

    const { error } = await supabase
      .from("licenses")
      .update({ active })
      .eq("license_key", key.toUpperCase());

    if (error) throw error;

    res.json({ message: "License updated successfully" });
  } catch (err) {
    console.error('Error updating license:', err);
    res.status(500).json({ error: "Failed to update license" });
  }
});

export default router;
