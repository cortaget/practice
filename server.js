const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'your_secret_key';
const usersFilePath = path.join(__dirname, 'data', 'users.json');

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to read users from file
const readUsersFromFile = () => {
  try {
    const usersData = fs.readFileSync(usersFilePath);
    return JSON.parse(usersData);
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
};

// Helper function to write users to file
const writeUsersToFile = (users) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error writing users file:', err);
  }
};

// Register route
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }

    const users = readUsersFromFile();
    const userExists = users.find(user => user.username === username);

    if (userExists) {
      return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword };
    users.push(newUser);
    writeUsersToFile(users);
    res.status(201).send('User registered');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }

    const users = readUsersFromFile();
    const user = users.find(user => user.username === username);

    if (!user) {
      return res.status(400).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    res.status(200).send('Logged in');
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send('Error logging in');
  }
});

// Profile route
app.get('/profile', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send('Unauthorized');
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.status(200).send(`Welcome user ${decoded.username}`);
  } catch (error) {
    res.status(401).send('Invalid token');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
