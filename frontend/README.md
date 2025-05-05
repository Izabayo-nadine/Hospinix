# Hospital Management System - Frontend

A modern frontend for the Hospital Management System that connects to a Spring Boot backend API.

## Features

- **Role-based Access Control**: Different dashboards for Admin, Doctor, Pharmacist, and Receptionist
- **Patient Management**: Register, view, and update patient information
- **Appointment Scheduling**: Create and manage patient appointments
- **Prescription Management**: Generate and track prescriptions
- **Medical Records**: Maintain comprehensive patient medical records
- **User Management**: Admin interface for managing system users
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- React.js
- React Router for navigation
- Axios for API calls
- TailwindCSS for styling
- JWT for authentication
- React Query for data fetching

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- NPM (v6.0.0 or later)
- Backend server running on `http://localhost:8080`

### Installation

1. Clone the repository

   ```
   git clone https://github.com/yourusername/hospital-management-frontend.git
   cd hospital-management-frontend
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Create a `.env` file in the root directory

   ```
   REACT_APP_API_URL=http://localhost:8080
   ```

4. Start the development server

   ```
   npm start
   ```

5. The application will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── public/                  # Public assets
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Common UI elements
│   │   ├── layouts/         # Page layouts
│   │   └── ...
│   ├── pages/               # Page components
│   │   ├── admin/           # Admin pages
│   │   ├── doctor/          # Doctor pages
│   │   ├── pharmacist/      # Pharmacist pages
│   │   ├── receptionist/    # Receptionist pages
│   │   └── ...
│   ├── services/            # API services
│   ├── utils/               # Utility functions
│   ├── App.js               # Main App component
│   └── index.js             # Application entry point
├── .env                     # Environment variables
└── package.json             # Project dependencies
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

## Authentication

The application uses JWT (JSON Web Tokens) for authentication. Upon successful login, a token is stored in local storage and included in the Authorization header of subsequent API requests.

Default login credentials are provided in the `INTEGRATION_GUIDE.md` file.

## Integration Guide

Please refer to the `INTEGRATION_GUIDE.md` file for detailed instructions on integrating with the backend API.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Spring Boot for the backend API
- React.js and its ecosystem for the frontend
- All contributors who have helped shape this project
