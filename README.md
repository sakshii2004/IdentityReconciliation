# Overview
This backend API identifies and manages contact information by consolidating multiple entries with the same email or phone number into a structured relationship of primary and secondary contacts.

# Tech Stack
- Node.js, Express.js
- MySQL with Sequelize ORM
- AWS Relational Database
- dotenv for environment variable management

# Project Structure
src/
- config/
  - database.js            # Sequelize DB connection
- controllers/
  - identify.controller.js # Core logic for contact identification
- models/
  - contact.js             # Sequelize Contact model
- routes/
  - identify.route.js      # Route for POST /identify
- index.js                 # Entry point of the server

# API Endpoint
Available at: https://identityreconciliationsakshisah.onrender.com

Sample Request Format:
`{
  "email": "example@email.com",
  "phoneNumber": "1234567890"
}`

# Contact Model
id:
- Type: INTEGER
- Primary key, auto-incremented

email:
- Type: STRING
- Optional (nullable)

phoneNumber:
- Type: STRING
- Optional (nullable)

linkPrecedence:
- Type: ENUM('primary', 'secondary')
- Indicates if the contact is a primary or linked (secondary) contact
- Required (non-null)

linkedId:
- Type: INTEGER
- Nullable
- Refers to the primary contact's id if this contact is secondary

createdAt:
- Type: DATE
- Automatically set on creation

updatedAt:
- Type: DATE
- Automatically updated on modification

deletedAt:
- Type: DATE
- Used for soft deletion (enabled via Sequelize’s paranoid mode)

# Environment Variables (.env)
`DB_NAME=your_db`
`DB_USER=your_user`
`DB_PASS=your_password`
`DB_HOST=localhost`
`DB_PORT=3306`

# Install dependencies
`npm install`

# Start server
`npm run dev    # for development with nodemon`
`npm start      # for production`
