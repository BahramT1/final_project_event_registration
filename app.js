const express = require('express');
const path = require('path');
const mariadb = require('mariadb');

const app = express();
const PORT = 3003;

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: false }));

// Serve static files for styles and pictures
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/pictures', express.static(path.join(__dirname, 'pictures')));

// Set up EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MariaDB connection pool configuration
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root', // MariaDB username
    password: 'Pakhtoon2002@', // MariaDB password
    database: 'final_project', // MariaDB database name
    connectionLimit: 5, // Maximum number of connections
});

// Route: Home Page
// Displays all events from the database
app.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const events = await connection.query('SELECT * FROM events'); // Fetch all events
        res.render('home', { events }); // Render the home page with the events
    } catch (err) {
        console.error(err); // Log any errors
        res.status(500).send('Internal Server Error');
    }
});

// Route: Create Event Page
// Renders the form to create a new event
app.get('/create-event', (req, res) => {
    res.render('create-event'); // Render the Create Event form
});

// Route: Handle Create Event Form Submission
// Inserts a new event into the database
app.post('/create-event', async (req, res) => {
    const { title, category, date, description, maxAttendees } = req.body; // Extract form data
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query(
            'INSERT INTO events (title, category, date, description, maxAttendees) VALUES (?, ?, ?, ?, ?)',
            [title, category, date, description, maxAttendees]
        );
        res.render('event-confirmation', {
            eventTitle: title,
            eventCategory: category,
            eventDate: date,
            eventDescription: description,
        }); // Render confirmation page
    } catch (err) {
        console.error('Error Creating Event:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route: Register for Event Page
// Displays the registration form for a specific event
app.get('/register/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [event] = await connection.query('SELECT * FROM events WHERE id = ?', [req.params.id]); // Fetch event details
        if (!event) {
            res.status(404).send('Event not found'); // Handle case if event doesn't exist
            return;
        }
        res.render('register', { event }); // Render the registration form
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Route: Handle Registration Form Submission
// Inserts a new registration and updates the event's attendee count
app.post('/register/:id', async (req, res) => {
    const { userName, email } = req.body; // Extract form data
    const eventId = req.params.id; // Event ID from URL

    let connection;
    try {
        connection = await pool.getConnection();
        const [event] = await connection.query('SELECT * FROM events WHERE id = ?', [eventId]); // Fetch event details

        if (!event) {
            res.status(404).send('Event not found'); // Handle case if event doesn't exist
            return;
        }

        if (event.attendees < event.maxAttendees) {
            // Add registration and increment attendee count
            await connection.query('INSERT INTO registrations (eventId, userName, email) VALUES (?, ?, ?)', [
                eventId,
                userName,
                email,
            ]);

            await connection.query('UPDATE events SET attendees = attendees + 1 WHERE id = ?', [eventId]);

            res.render('confirmation', {
                userName,
                email,
                eventTitle: event.title,
                eventDate: event.date,
                eventId: event.id,
            }); // Render registration confirmation page
        } else {
            res.send('Event is full!'); // Handle case if event is fully booked
        }
    } catch (err) {
        console.error('Error Registering User:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route: Delete Event
// Deletes an event and its associated registrations
app.post('/delete-event/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        // Delete all registrations associated with the event
        await connection.query('DELETE FROM registrations WHERE eventId = ?', [req.params.id]);

        // Delete the event itself
        await connection.query('DELETE FROM events WHERE id = ?', [req.params.id]);
        res.redirect('/'); // Redirect to the homepage after deletion
    } catch (err) {
        console.error('Error Deleting Event:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
