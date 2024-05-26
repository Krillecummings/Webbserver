<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PHP Node.js Integration</title>
</head>
<body>
    <h1>PHP och Node.js Integration</h1>
    <form id="registerForm">
        <h2>Registrera</h2>
        <label for="name">Namn:</label>
        <input type="text" id="name" name="name" required>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
        <label for="username">Användarnamn:</label>
        <input type="text" id="username" name="username" required>
        <label for="password">Lösenord:</label>
        <input type="password" id="password" name="password" required>
        <button type="submit">Registrera</button>
    </form>
    <form id="loginForm">
        <h2>Logga in</h2>
        <label for="loginUsername">Användarnamn:</label>
        <input type="text" id="loginUsername" name="loginUsername" required>
        <label for="loginPassword">Lösenord:</label>
        <input type="password" id="loginPassword" name="loginPassword" required>
        <button type="submit">Logga in</button>
    </form>

    <script>
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            console.log(result);
        });

        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: data.loginUsername,
                    password: data.loginPassword
                })
            });

            const result = await response.json();
            console.log(result);
        });
    </script>
</body>
</html>
