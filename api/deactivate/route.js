import { supabase } from "../../utils/supabaseClient.js";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-admin-secret'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow DELETE
  if (req.method !== 'DELETE') {
    return res.status(405).send("ERR|METHOD|method not allowed");
  }

  // Check admin authorization
  if (req.headers["x-admin-secret"] !== process.env.ADMIN_SECRET) {
    return res.status(401).send("ERR|AUTH|unauthorized");
  }

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

    res.status(200).send("OK|DEACTIVATED");
  } catch (err) {
    console.error('Deactivation error:', err);
    res.status(500).send("ERR|INTERNAL|unexpected error");
  }
}
