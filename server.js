require('dotenv').config();
const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Funktion för att skapa en databasanslutning
async function getDBConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "databasen",
  });
}

// Funktion för att validera användardata
function isValidUserData(body) {
  return body && body.username && body.name && body.email && body.password;
}

// Middleware för att verifiera JWT-token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

// Registrera ny användare
app.post("/register", async (req, res) => {
  const { name, email, password, username } = req.body;

  if (!isValidUserData(req.body)) {
    return res.status(400).json({ error: "Ogiltig användardata" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const connection = await getDBConnection();
    const sql = `INSERT INTO users (name, email, password, username) VALUES (?, ?, ?, ?)`;
    const [result] = await connection.execute(sql, [name, email, hashedPassword, username]);
    await connection.end();

    res.status(201).json({ id: result.insertId, name, email, username });
  } catch (error) {
    console.error("Fel under registrering:", error);
    res.status(500).json({ error: "Internt serverfel" });
  }
});

// Inloggning
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const connection = await getDBConnection();
    const sql = "SELECT * FROM users WHERE username = ?";
    const [results] = await connection.execute(sql, [username]);
    await connection.end();

    if (results.length === 0) {
      return res.status(401).json({ error: "Ogiltiga inloggningsuppgifter" });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const { password, ...userWithoutPassword } = user;
      const payload = { sub: user.id, name: user.name };
      const token = jwt.sign(payload, process.env.JWT_SECRET);

      res.json({ token, user: userWithoutPassword });
    } else {
      res.status(401).json({ error: "Ogiltiga inloggningsuppgifter" });
    }
  } catch (error) {
    console.error("Fel under inloggningsprocessen:", error);
    res.status(500).json({ error: "Internt serverfel" });
  }
});

// Hämta alla användare (endast för demonstration, inte säkert att exponera alla användare så här)
app.get("/users", async (req, res) => {
  try {
    const connection = await getDBConnection();
    const sql = `SELECT id, name, email, username FROM users`;
    const [results] = await connection.execute(sql);
    await connection.end();

    res.json(results);
  } catch (error) {
    console.error("Fel uppstod:", error);
    res.status(500).json({ error: "Internt serverfel" });
  }
});

// Uppdatera användare
app.put("/users/:id", authenticateToken, async (req, res) => {
  const { name, email } = req.body;
  const { id } = req.params;

  try {
    const connection = await getDBConnection();
    const sql = `UPDATE users SET name = ?, email = ? WHERE id = ?`;
    const [results] = await connection.execute(sql, [name, email, id]);
    await connection.end();

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Användaren hittades inte" });
    }

    res.json({ message: "Användaren uppdaterades framgångsrikt" });
  } catch (error) {
    console.error("Fel uppstod:", error);
    res.status(500).json({ error: "Internt serverfel" });
  }
});

// Starta servern
app.listen(port, () => {
  console.log(`Servern lyssnar på http://localhost:${port}`);
});
