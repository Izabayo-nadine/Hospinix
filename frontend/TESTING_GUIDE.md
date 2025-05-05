# Testing Guide for Hospital Management System

This guide will help you test the functionality of the Hospital Management System frontend application.

## Prerequisites

1. Backend server running on `http://localhost:8080`
2. Frontend running on `http://localhost:3000`

## 1. Starting the Applications

### Backend

1. Navigate to the backend directory

   ```
   cd backend
   ```

2. Start the Spring Boot application
   ```
   ./mvnw spring:run
   ```
   or
   ```
   mvn spring-boot:run
   ```

### Frontend

1. Navigate to the frontend directory

   ```
   cd frontend
   ```

2. Install dependencies (if not already done)

   ```
   npm install
   ```

3. Start the React application
   ```
   npm start
   ```

## 2. Login Testing

1. Open your browser and navigate to `http://localhost:3000`
2. You should be redirected to the login page
3. Use the following credentials to test different roles:

   | Role         | Email                     | Password        |
   | ------------ | ------------------------- | --------------- |
   | Admin        | admin@hospital.com        | admin123        |
   | Doctor       | doctor@hospital.com       | doctor123       |
   | Pharmacist   | pharmacist@hospital.com   | pharmacist123   |
   | Receptionist | receptionist@hospital.com | receptionist123 |

4. Verify that after successful login, you are redirected to the appropriate dashboard based on your role

## 3. Admin Dashboard Testing

After logging in as an admin:

1. **Dashboard Overview**

   - Verify that statistics are displayed (users, patients, appointments, etc.)
   - Check that all numbers match the expected values from the backend

2. **User Management**

   - Navigate to the Users page
   - Verify that you can see the list of all users
   - Test the search and filter functionality
   - Create a new doctor:
     - Click "Add User" or "Create User"
     - Fill in all required fields (name, email, password, role as "DOCTOR")
     - Submit the form
     - Verify that the new doctor appears in the list
   - Edit a user:
     - Click the edit button next to a user
     - Modify some information
     - Save changes
     - Verify changes are reflected
   - Delete a user (if implemented):
     - Click the delete button next to a user
     - Confirm deletion
     - Verify user is removed from the list

3. **Patient Management**
   - Navigate to the Patients page
   - Verify that you can see the list of all patients
   - Test search and filter functionality

## 4. Doctor Dashboard Testing

After logging in as a doctor:

1. **Dashboard Overview**

   - Verify that doctor-specific statistics are displayed

2. **Appointments**

   - Navigate to the Appointments page
   - Verify that you can see your appointments
   - Test filter by date and status
   - Complete an appointment:
     - Find a "SCHEDULED" appointment
     - Click "Complete" or similar button
     - Add notes
     - Submit
     - Verify status changes to "COMPLETED"

3. **Prescriptions**

   - Navigate to the Prescriptions page
   - Verify that you can see your prescriptions
   - Create a new prescription:
     - Click "Create Prescription" or similar
     - Select a patient
     - Add medications with dosage information
     - Submit the form
     - Verify the new prescription appears in the list

4. **Medical Records**
   - Navigate to the Medical Records page
   - Verify you can search for patients
   - View a patient's medical history
   - Check that all medical records are displayed properly

## 5. Pharmacist Dashboard Testing

After logging in as a pharmacist:

1. **Dashboard Overview**

   - Verify that pharmacist-specific statistics are displayed

2. **Medicines**

   - Navigate to the Medicines page
   - Verify that you can see the list of medicines
   - Test search and filter functionality
   - Add a new medicine:
     - Click "Add Medicine" or similar
     - Fill in all required fields
     - Submit the form
     - Verify the new medicine appears in the list

3. **Companies**

   - Navigate to the Companies page
   - Verify that you can see the list of companies
   - Add a new company:
     - Click "Add Company" or similar
     - Fill in the details
     - Submit the form
     - Verify the new company appears in the list

4. **Prescriptions**
   - Navigate to the Prescriptions page
   - Verify that you can see active prescriptions
   - Fill a prescription:
     - Find an "ACTIVE" prescription
     - Click "Fill" or similar
     - Verify status changes to "FILLED" or "COMPLETED"

## 6. Receptionist Dashboard Testing

After logging in as a receptionist:

1. **Dashboard Overview**

   - Verify that receptionist-specific statistics are displayed

2. **Patient Registration**

   - Navigate to the Patients page
   - Register a new patient:
     - Click "Register Patient" or similar
     - Fill in all required patient information
     - Submit the form
     - Verify the new patient appears in the list

3. **Appointment Scheduling**
   - Navigate to the Appointments page
   - Schedule a new appointment:
     - Click "Schedule Appointment" or similar
     - Select a patient
     - Select a doctor
     - Choose date and time
     - Submit the form
     - Verify the new appointment appears in the list

## 7. General Testing

1. **Responsive Design**

   - Test the application on different screen sizes (desktop, tablet, mobile)
   - Verify that all elements are displayed properly and are usable

2. **Error Handling**

   - Test invalid inputs in forms
   - Verify that appropriate error messages are displayed
   - Test network errors (e.g., turn off the backend server)
   - Verify that appropriate error messages are displayed

3. **Session Management**
   - Test token expiration (may require modifying the token expiration time in the backend)
   - Verify that you are redirected to the login page when the token expires
   - Test logging out
   - Verify that you cannot access protected routes after logging out

## 8. Security Testing

1. **Authentication**

   - Test accessing protected routes without authentication
   - Verify you are redirected to login

2. **Authorization**
   - Test accessing routes not authorized for your role
   - For example, log in as a doctor and try to access admin routes
   - Verify you are redirected appropriately

## Troubleshooting Common Issues

1. **Backend Connection Issues**

   - Verify the backend is running on port 8080
   - Check CORS configuration in the backend
   - Check the network tab in browser developer tools for error messages

2. **Login Issues**

   - Verify that you are using the correct credentials
   - Check if the JWT token is being stored properly in localStorage

3. **Data Not Displaying**

   - Check network requests in browser developer tools
   - Verify that API calls are returning the expected data
   - Check console for any JavaScript errors

4. **Form Submission Issues**
   - Verify that all required fields are filled
   - Check validation errors in the console
   - Verify that the API endpoints are correct

## Final Notes

If you encounter any issues that cannot be resolved using this guide, check the console logs in your browser's developer tools for more detailed error messages. These can provide valuable information for debugging.

When testing, it's also helpful to keep the backend console open to see any errors that might be occurring on the server side.
