This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Hospital Pharmacy Management System

This project contains both the frontend and backend for the Hospital Pharmacy Management System.

### Getting Started

#### Prerequisites

- Java 17 or higher
- Maven
- Node.js 18 or higher
- PostgreSQL database

#### Database Setup

1. Install PostgreSQL if you haven't already
2. Create a new database named `pharmacydb`
3. Configure the database connection in `backend/src/main/resources/application.properties`

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/pharmacydb
spring.datasource.username=postgres
spring.datasource.password=your_password
```

#### Starting the Backend

1. Open a terminal in the project root directory
2. Run the startup script:
   ```
   start-backend.bat
   ```
   Or manually:
   ```
   cd backend
   mvn spring-boot:run
   ```
3. The backend will start on http://localhost:8080

#### Starting the Frontend

1. Open a new terminal in the project root directory
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. The frontend will start on http://localhost:3000

### Testing the API Connection

1. Start both the backend and frontend as described above
2. Navigate to http://localhost:3000/api-test in your browser
3. The page will show the status of the API connection, dashboard stats, and sample medicine data

### Troubleshooting

- If the API connection fails, ensure the backend is running at http://localhost:8080
- Check the PostgreSQL database connection in the backend application.properties
- Verify that the Next.js rewrites in next.config.js are correctly configured
- Look for errors in the browser console and backend logs

### API Proxy Configuration

The frontend uses Next.js API routes to proxy requests to the backend, avoiding CORS issues:

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8081/:path*",
      },
    ];
  },
};
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
