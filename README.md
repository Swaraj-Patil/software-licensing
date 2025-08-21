# Software Licensing API

A robust REST API service for managing software licenses with support for subscription-based and one-time purchase licensing models. Built with Express.js and Supabase, this service provides secure license management with multi-account activation support.

## Features

- **Flexible Licensing Plans**: Support for multiple plan types (basic, pro, enterprise)
- **Time-Based Licensing**: Configure license duration with automatic expiration
- **Multi-Account Support**: Control the number of simultaneous activations per license
- **Secure Authentication**: Admin-protected endpoints using API key authentication
- **Activity Tracking**: Monitor license activations and validations
- **RESTful API**: Well-documented endpoints with Swagger/OpenAPI specification

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: Supabase (PostgreSQL)
- **Documentation**: Swagger/OpenAPI 3.0
- **Deployment**: Vercel
- **Authentication**: API Key-based (x-admin-secret)

## API Endpoints

### 1. Issue License
```http
POST /api/issue
```
Creates a new license with specified parameters:
- Plan type (pro/basic/enterprise)
- Maximum allowed accounts
- Duration in days

### 2. Validate License
```http
GET /api/validate
```
Validates and activates a license for specific account/server:
- Checks license validity and expiration
- Manages activation limits
- Records activation details

### 3. Deactivate License
```http
DELETE /api/deactivate
```
Deactivates a license entirely:
- Sets license to inactive
- Removes all associated activations

## Database Schema

### Licenses Table
- id (UUID, primary key)
- license_key (text, unique)
- plan (text: pro/basic/enterprise)
- max_accounts (integer)
- expires_at (timestamptz)
- active (boolean)
- created_at (timestamptz)

### Activations Table
- id (UUID, primary key)
- license_id (UUID, foreign key)
- account (bigint)
- server (text)
- created_at (timestamptz)
- last_validated (timestamptz)

## Setup

1. Clone the repository
```bash
git clone https://github.com/Swaraj-Patil/software-licensing.git
cd software-licensing
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a .env file with:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_SECRET=your_admin_secret
```

4. Initialize database
```bash
node scripts/setup-db.js
```

5. Start the server
```bash
npm run dev # for development
npm start   # for production
```

## API Documentation

Access the interactive API documentation at:
- Local: http://localhost:3000/docs
- Production: https://your-domain.com/docs

## Testing

Use the included PowerShell test script to verify functionality:
```powershell
./test-api.ps1
```

## Security Considerations

1. All sensitive endpoints are protected with admin secret authentication
2. License keys are generated using cryptographically secure methods
3. Database access is restricted using Supabase RLS policies
4. Input validation on all endpoints
5. CORS configured for secure access

## Error Handling

The API uses standardized error responses:
- ERR|AUTH|unauthorized
- ERR|NOT_FOUND|license
- ERR|EXPIRED|license expired
- ERR|LIMIT|max activations reached
- ERR|BAD_REQUEST|missing params
- ERR|INTERNAL|unexpected error

## Deployment

The service is configured for deployment on Vercel:
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically with git push

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
