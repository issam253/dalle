const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.get('/dalle', async (req, res) => {
  const { text_query } = req.query;

  const options = {
    method: 'POST',
    url: 'https://text-to-image-dalle.p.rapidapi.com/generate/photon',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': '3fa82b3121msh60993f970f09819p15c22cjsncc0b065b5f1c',
      'X-RapidAPI-Host': 'text-to-image-dalle.p.rapidapi.com',
    },
    data: {
      text_query: text_query,
    },
  };

  try {
    const response = await axios.request(options);
    const { image_url, message, status } = response.data;
    res.json({ image_url, message, status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
