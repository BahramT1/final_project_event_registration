const express = require('express');
const path = require('path');
const mariadb = require('mariadb');

const app = express();
const PORT = 3003;

// Middleware for parsing form data and serving static files
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Database connection pool
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Pakhtoon2002@',
    database: 'final_project',
});

// Database connection function
async function connect() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log('Connected to the database');
        return conn;
    } catch (err) {
        console.error('Database connection error:', err);
        throw err;
    }
}


// Home page: Show all events
app.get('/', async (req, res) => {
    const conn = await connect();
    const events = await conn.query('SELECT * FROM events');
    res.render('home', { events });
});

// Create Event Page
app.get('/create-event', (req, res) => {
    res.render('create-event');
});

// Add a new event
app.post('/create-event', async (req, res) => {
    const data = req.body;

    // Validation checks
    if (!data.title || !data.category || !data.date || !data.description || !data.maxAttendees) {
        res.render('create-event', { data, errors: ['All fields are required.'] });
        return;
    }

    // Connect to the database
    const conn = await pool.getConnection();

    // Insert event into the database
    const query = `
        INSERT INTO events (title, category, date, description, maxAttendees) 
        VALUES ('${data.title}', '${data.category}', '${data.date}', '${data.description}', 
        ${data.maxAttendees});
    `;
    await conn.query(query);

    // Render confirmation page
    res.render('event-confirmation', { data });

});



app.get('/register/:id', async (req, res) => {
    const conn = await connect();
    const result = await conn.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    const event = result[0];

    if (!event) {
        return res.send('Event not found');
    }
    res.render('register', { event, data: {}, errors: [] });
});


app.post('/register/:id', async (req, res) => {
    const data = req.body;
    const eventId = req.params.id; // Get the event ID from the URL

    const conn = await connect();

    // Fetch the event details
    const [event] = await conn.query(`SELECT * FROM events WHERE id = ${eventId}`);

    if (!event) {
        res.status(404).send('Event not found');
        return;
    }

    // Validation checks
    if (!data.userName || !data.email) {
        res.render('register', { event, data, errors: ['All fields are required.'] });
        return;
    }

    // Check if the event has space for more attendees
    if (event.attendees < event.maxAttendees) {
        // Register the user and update the attendee count
        const insertQuery = `
            INSERT INTO registrations (eventId, userName, email)
            VALUES ('${eventId}', '${data.userName}', '${data.email}');
        `;
        const updateQuery = `
            UPDATE events SET attendees = attendees + 1 WHERE id = ${eventId};
        `;
        await conn.query(insertQuery);
        await conn.query(updateQuery);

        // Render the confirmation page
        res.render('confirmation', {
            data: { // Pass the required data to the view
                userName: data.userName,
                email: data.email,
                eventTitle: event.title,
                eventDate: new Date(event.date).toDateString(),
            },
        });
    } else {
        // Event is full
        res.render('register', { event, data, errors: ['Event is full!'] });
    }
});




// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
