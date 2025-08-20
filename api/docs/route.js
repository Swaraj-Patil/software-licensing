import { createClient } from "@supabase/supabase-js";
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../../swagger.json' assert { type: "json" };

// Initialize Swagger
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

  // Serve Swagger UI for GET requests
  if (req.method === 'GET') {
    const html = swaggerUi.generateHTML(swaggerDocument);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
