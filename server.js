const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

app.get('/api/games', async (req, res) => {
  const today = new Date();
  today.setHours(today.getHours() - 4); // Adjust this value based on your time zone
  const formattedDate = today.toISOString().split('T')[0];

  const apiUrl = `https://www.balldontlie.io/api/v1/games?start_date=${formattedDate}&end_date=${formattedDate}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': 'Bearer dd1b780a-32c4-411d-90e1-1befe56aabe0'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching NBA games:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});