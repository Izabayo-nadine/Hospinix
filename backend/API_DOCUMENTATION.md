# Hospital Pharmacy Management System API Documentation

This document provides information about API endpoints available for the frontend to integrate with the backend.

## Base URL

`http://localhost:8080`

## Authentication

### Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "admin@hospital.com",
    "password": "admin123"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt-token-here",
    "userId": "ADM-12345678",
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@hospital.com",
    "role": "ADMIN"
  }
  ```

### Register

- **URL**: `/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "role": "DOCTOR",
    "phoneNumber": "1234567890",
    "address": "123 Main St, City",
    "gender": "Male",
    "specialization": "Cardiology",
    "licenseNumber": "12345"
  }
  ```
- **Response**: Same as login

### Validate Token

- **URL**: `/auth/validate`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**: User data if token is valid

### Create Initial Admin (for first-time setup)

- **URL**: `/auth/create-admin`
- **Method**: `POST`
- **Response**:
  ```json
  {
    "message": "Initial admin created successfully",
    "email": "admin@hospital.com",
    "password": "admin123"
  }
  ```

## Dashboard Data

### Get Dashboard Statistics

- **URL**: `/data/dashboard-stats`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**: Statistics for the dashboard

### Get All Users

- **URL**: `/data/users`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**: List of all users

### Get All Patients

- **URL**: `/data/patients`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**: List of all patients

### Get All Doctors

- **URL**: `/data/doctors`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**: List of doctors

### Get Account Types

- **URL**: `/data/account-types`
- **Method**: `GET`
- **Response**: List of available account types

## Admin Operations

### Admin Dashboard

- **URL**: `/admin/dashboard`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**: Admin dashboard statistics

### Get Users

- **URL**: `/admin/users?role=DOCTOR&active=true&search=John`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Query Parameters**:
  - `role`: Filter by role (optional)
  - `active`: Filter by active status (optional)
  - `search`: Search by name or email (optional)
- **Response**: List of filtered users

### Create User

- **URL**: `/admin/users`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Request Body**: User data
- **Response**: Created user

### Update User

- **URL**: `/admin/users/{id}`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Request Body**: Updated user data
- **Response**: Updated user

### Delete User

- **URL**: `/admin/users/{id}`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**: Success message

## Doctor Operations

### Doctor Dashboard

- **URL**: `/doctor/dashboard`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**: Doctor dashboard statistics

### Get Doctor's Patients

- **URL**: `/doctor/patients?status=Active&search=John`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Query Parameters**:
  - `status`: Filter by status (optional)
  - `search`: Search by name or ID (optional)
- **Response**: List of doctor's patients

### Get Doctor's Appointments

- **URL**: `/doctor/appointments`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Query Parameters**:
  - `status`: Filter by status (optional)
  - `patientId`: Filter by patient ID (optional)
  - `startDate`: Filter by start date (optional)
  - `endDate`: Filter by end date (optional)
- **Response**: List of appointments

### Complete Appointment

- **URL**: `/doctor/appointments/{id}/complete`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Request Body**:
  ```json
  {
    "notes": "Patient is doing well. Prescribed medication."
  }
  ```
- **Response**: Updated appointment

### Create Prescription

- **URL**: `/doctor/prescriptions`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Request Body**: Prescription data
- **Response**: Created prescription

### Get Doctor's Prescriptions

- **URL**: `/doctor/prescriptions`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Query Parameters**:
  - `status`: Filter by status (optional)
  - `patientId`: Filter by patient ID (optional)
  - `startDate`: Filter by start date (optional)
  - `endDate`: Filter by end date (optional)
- **Response**: List of prescriptions

## Pharmacist Operations

### Pharmacist Dashboard

- **URL**: `/pharmacist/dashboard`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**: Pharmacist dashboard statistics

### Get Medicines

- **URL**: `/pharmacist/medicines`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Query Parameters**:
  - `category`: Filter by category (optional)
  - `stockStatus`: Filter by stock status (optional)
  - `prescriptionFilter`: Filter by prescription requirement (optional)
- **Response**: List of medicines

### Search Medicines

- **URL**: `/pharmacist/medicines/search?keyword=Aspirin`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Query Parameters**:
  - `keyword`: Search keyword
- **Response**: List of matching medicines

### Create Medicine

- **URL**: `/pharmacist/medicines`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Request Body**: Medicine data
- **Response**: Created medicine

### Update Medicine

- **URL**: `/pharmacist/medicines/{medicineId}`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Request Body**: Updated medicine data
- **Response**: Updated medicine

### Delete Medicine

- **URL**: `/pharmacist/medicines/{medicineId}`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**: Success message

### Get Companies

- **URL**: `/pharmacist/companies`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Query Parameters**:
  - `status`: Filter by status (optional)
  - `name`: Filter by name (optional)
- **Response**: List of companies

### Create Company

- **URL**: `/pharmacist/companies`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Request Body**: Company data
- **Response**: Created company

### Update Company

- **URL**: `/pharmacist/companies/{id}`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Request Body**: Updated company data
- **Response**: Updated company

### Get Active Prescriptions

- **URL**: `/pharmacist/prescriptions`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**: List of active prescriptions

### Fill Prescription

- **URL**: `/pharmacist/prescriptions/{id}/fill`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**: Updated prescription

## Receptionist Operations

### Receptionist Dashboard

- **URL**: `/receptionist/dashboard`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**: Receptionist dashboard statistics

### Get Patients

- **URL**: `/receptionist/patients`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Query Parameters**:
  - `status`: Filter by status (optional)
  - `search`: Search by name or ID (optional)
- **Response**: List of patients

### Register Patient

- **URL**: `/receptionist/patients`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Request Body**: Patient data
- **Response**: Registered patient

### Update Patient

- **URL**: `/receptionist/patients/{id}`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Request Body**: Updated patient data
- **Response**: Updated patient

### Get Available Doctors

- **URL**: `/receptionist/doctors`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**: List of available doctors

### Schedule Appointment

- **URL**: `/receptionist/appointments`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Request Body**: Appointment data
- **Response**: Scheduled appointment

### Get Appointments

- **URL**: `/receptionist/appointments`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Query Parameters**: Various filters
- **Response**: List of appointments

### Update Appointment

- **URL**: `/receptionist/appointments/{id}`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Request Body**: Updated appointment data
- **Response**: Updated appointment

## Default Login Credentials

After starting the application for the first time, the following accounts are created:

1. **Admin**

   - Email: admin@hospital.com
   - Password: admin123

2. **Doctor**

   - Email: doctor@hospital.com
   - Password: doctor123

3. **Pharmacist**

   - Email: pharmacist@hospital.com
   - Password: pharmacist123

4. **Receptionist**
   - Email: receptionist@hospital.com
   - Password: receptionist123
