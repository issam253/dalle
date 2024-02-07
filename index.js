const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/dalle', async (req, res) => {
  try {
    const prompt = req.query.prompt;
    const options = {
      method: 'POST',
      url: 'https://text-to-image-dalle.p.rapidapi.com/generate/photon',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': '0820ec24afmsh10d1bef860c3651p10e3f6jsn715a93754ace',
        'X-RapidAPI-Host': 'text-to-image-dalle.p.rapidapi.com'
      },
      data: { text_query: prompt }
    };

    const response = await axios.request(options);
    const imageUrl = response.data.image_url;
    res.json({ imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
