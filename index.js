const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.get('/imagine', async (req, res) => {
  const { prompt } = req.query;

  const options = {
    method: 'POST',
    url: 'https://fast-stable-diffusion-xl.p.rapidapi.com/generate',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': '3fa82b3121msh60993f970f09819p15c22cjsncc0b065b5f1c',
      'X-RapidAPI-Host': 'fast-stable-diffusion-xl.p.rapidapi.com',
    },
    data: {
      prompt: prompt,
      negativePrompt: 'example negativePrompt',
    },
  };

  try {
    const response = await axios.request(options);
    const { ImageUrl } = response.data;
    res.json({ imageUrl: ImageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
