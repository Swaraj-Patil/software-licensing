import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupDatabase() {
  try {
    // Check if tables exist by attempting to query them
    const { data: licensesData, error: licensesError } = await supabase
      .from('licenses')
      .select('id')
      .limit(1);

    const { data: activationsData, error: activationsError } = await supabase
      .from('activations')
      .select('id')
      .limit(1);

    // If tables don't exist, the errors will be related to missing tables
    if (licensesError || activationsError) {
      console.log('Tables not found. Creating schema...');
      
      // We'll need to use Supabase Dashboard's SQL Editor to create the tables
      console.log(`
Please execute the following SQL in your Supabase Dashboard's SQL Editor:

create table licenses (
  id uuid primary key default gen_random_uuid(),
  license_key text unique not null,
  plan text not null default 'pro',
  max_accounts int not null default 1,
  expires_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table activations (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references licenses(id) on delete cascade,
  account bigint not null,
  server text not null,
  created_at timestamptz not null default now(),
  unique(license_id, account, server)
);
      `);

      console.log('Please execute the SQL commands in your Supabase SQL Editor and then run this script again to verify the setup.');
      process.exit(1);
    } else {
      console.log('Database tables already exist and are properly configured.');
      console.log('Schema verification complete.');
    }

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
