# Capstone-2026

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables:
   ```bash
   cp .env.example .env
   # Edit the .env file to configure DATABASE_URL and JWT_SECRET
   ```
4. Generate Prisma client and migrate the database:
   ```bash
   npx prisma migrate dev --name init
   ```
5. (Optional) Seed the database:
   ```bash
   npm run seed
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```
   The backend server will run at **http://localhost:3000**.

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables:
   ```bash
   cp .env.example .env
   # Edit the .env file to configure VITE_API_URL and VITE_AI_API_URL
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend application will run at **http://localhost:5173**.

---

## Test User (setelah seed)

```
Email:    dita@example.com
Password: password123
```