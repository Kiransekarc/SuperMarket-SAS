# Supermarket CRM - Login Credentials

## Admin Account

**Email:** `admin@gmail.com`  
**Password:** `admin123`  
**Role:** admin

---

## Other Users in Database

1. **Staff User**
   - Email: `staff@gmail.com`
   - Role: staff

2. **New Worker**
   - Email: `worker@gmail.com`
   - Role: staff

3. **Loki**
   - Email: `loki@gmail.com`
   - Role: staff

4. **VV**
   - Email: `vv@gmail.com`
   - Role: staff

---

## How to Login

1. Navigate to http://localhost:3000/login
2. Enter the email: `admin@gmail.com`
3. Enter the password: `admin123`
4. Click the **Login** button
5. You will be redirected to the dashboard

---

## Troubleshooting

If you still cannot log in:

1. Make sure both backend and frontend servers are running:
   - Backend: `npm start` in the backend folder (should run on port 5000)
   - Frontend: `npm start` in the frontend folder (should run on port 3000)

2. Check MongoDB is running and connected

3. To reset the admin password again, run:
   ```bash
   # From the backend folder:
   node resetAdminPassword.js "<NEW_PASSWORD>"

   # Optional: specify a different admin email
   node resetAdminPassword.js "<NEW_PASSWORD>" "admin@gmail.com"
   ```

4. To list all users in the database, run:
   ```bash
   node listUsers.js
   ```
