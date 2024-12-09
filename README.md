# Reservation App Backend Validation Demo

This project is a demonstration of a backend system built with **Node.js**, **Express.js**, and **MariaDB**. It includes form validation, database connectivity, and server-side rendering using **EJS**.

---

## Features
- **Home Page:** A dynamic form for submitting user reservations.
- **Validation:** Server-side validation for input fields.
- **Database:** Integration with MariaDB to store and fetch user data.
- **Confirmation Page:** Displays user details upon successful submission.
- **User List Page:** Lists all users from the database.

---

## Technologies Used
- **Backend:** Node.js, Express.js
- **Database:** MariaDB
- **Templating Engine:** EJS
- **CSS:** Static files served via Express

---

## Prerequisites
Ensure the following are installed on your system:
1. Node.js (v14 or above)
2. MariaDB
3. npm (comes with Node.js)

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd reservation-app-backend-validation-demo
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add the following variables:
```plaintext
DB_HOST=localhost
DB_USER=root
DB_PASS=1234
DB_NAME=reservations
PORT=3003
```

### 4. Create the Database
1. Open your MariaDB client (e.g., MySQL Workbench).
2. Run the following SQL commands to set up the database and table:
   ```sql
   CREATE DATABASE reservations;

   USE reservations;

   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       firstName VARCHAR(50),
       lastName VARCHAR(50),
       email VARCHAR(100),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

### 5. Run the Application
Start the server using Nodemon:
```bash
nodemon app.js
```
Or directly with Node:
```bash
node app.js
```

The application will run on `http://localhost:3003`.

---

## Project Structure
```plaintext
reservation-app-backend-validation-demo/
├── app.js                # Main application file
├── package.json          # Project metadata and dependencies
├── .env                  # Environment variables
├── public/               # Static files (CSS, images)
├── views/                # EJS templates
│   ├── home.ejs          # Home page template
│   ├── confirm.ejs       # Confirmation page template
│   ├── confirmations.ejs # User list template
└── README.md             # Project documentation
```

---

## Routes

### `/` (GET)
- Renders the home page with the reservation form.

### `/confirm` (POST)
- Validates the form input.
- Saves user details in the database.
- Displays the confirmation page.

### `/confirmations` (GET)
- Retrieves and displays all users from the database.

---

## Validation Rules
1. **First Name:** Cannot be empty.
2. **Last Name:** Cannot be empty.
3. **Email:** Must be valid and contain `@`.

---

## License
This project is open-source and available under the [MIT License](LICENSE).

---

## Author
**Bahram**  
Software Development Student  
Feel free to reach out for collaboration or feedback!
