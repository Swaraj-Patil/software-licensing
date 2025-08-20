import express from 'express';
import { createClient } from "@supabase/supabase-js";
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

// DELETE /api/deactivate?key=...&account=...&server=...
router.delete('/', async (req, res) => {
  try {
    const { key, account, server } = req.query;
    
    if (!key || !account || !server) {
      return res.status(400).send("ERR|BAD_REQUEST|missing params");
    }

    // Get license details
    const { data: license, error: licenseError } = await supabase
      .from("licenses")
      .select("id")
      .eq("license_key", key.toUpperCase())
      .single();

    if (licenseError || !license) {
      return res.status(404).send("ERR|NOT_FOUND|license");
    }

    // Delete the activation
    const { error: deleteError } = await supabase
      .from("activations")
      .delete()
      .eq("license_id", license.id)
      .eq("account", account)
      .eq("server", server);

    if (deleteError) {
      console.error('Deactivation error:', deleteError);
      return res.status(500).send("ERR|DB|deactivation failed");
    }

    res.send("OK|DEACTIVATED");
  } catch (err) {
    console.error('Deactivation error:', err);
    res.status(500).send("ERR|INTERNAL|unexpected error");
  }
});

export default router;
