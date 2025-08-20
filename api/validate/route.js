import { supabase } from "../../utils/supabaseClient.js";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).send("ERR|METHOD|method not allowed");
  }

  try {
    const { key, account, server } = req.query;
    if (!key || !account || !server) {
      return res.status(400).send("ERR|BAD_REQUEST|missing params");
    }

    // Validate input format
    if (!/^\d+$/.test(account)) {
      return res.status(400).send("ERR|BAD_REQUEST|invalid account number");
    }
    
    if (!/^[A-Za-z0-9.-]+$/.test(server)) {
      return res.status(400).send("ERR|BAD_REQUEST|invalid server name");
    }

    const { data: lic, error } = await supabase
      .from("licenses")
      .select("*")
      .eq("license_key", key.toUpperCase())
      .single();

    if (error || !lic) {
      return res.status(404).send("ERR|NOT_FOUND|license");
    }

    if (!lic.active) {
      return res.status(403).send("ERR|INACTIVE|license inactive");
    }
    
    if (new Date(lic.expires_at) < new Date()) {
      return res.status(403).send("ERR|EXPIRED|license expired");
    }

    // Count activations
    const { count } = await supabase
      .from("activations")
      .select("*", { count: "exact", head: true })
      .eq("license_id", lic.id);

    // If this account/server pair is new, add it if within limit
    const { data: existing } = await supabase
      .from("activations")
      .select("id")
      .eq("license_id", lic.id)
      .eq("account", account)
      .eq("server", server)
      .maybeSingle();

    if (!existing) {
      if (count >= lic.max_accounts) {
        return res.status(403).send("ERR|LIMIT|max activations reached");
      }

      const { error: aErr } = await supabase.from("activations").insert({
        license_id: lic.id,
        account: Number(account),
        server
      });

      if (aErr) {
        return res.status(500).send("ERR|DB|activation failed");
      }
    } else {
      // Update last_validated timestamp
      await supabase
        .from("activations")
        .update({ last_validated: new Date().toISOString() })
        .eq("id", existing.id);
    }

    // Return success with license details
    res.status(200).send(`OK|${lic.plan}|${lic.expires_at}`);
  } catch (err) {
    console.error('Validation error:', err);
    res.status(500).send("ERR|INTERNAL|unexpected error");
  }
}
