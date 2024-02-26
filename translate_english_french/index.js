import express from 'express';
import bodyParser from 'body-parser';
const { json } = bodyParser;
import mongoose from 'mongoose';
const { connect, connection, Schema, model } = mongoose;

import translate from 'translate-google';

const app = express();
const port = 3000;

connect('mongodb://localhost/translationDB', 
 { useNewUrlParser: true, 
   useUnifiedTopology: true
 });
const db = connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const translationSchema = new Schema({
  EnglishText: String,
  FrenchText: String,
});

const Translation = model('Translation', translationSchema);

app.use(json());

app.post('/translate', async (req, res) => {
  try {
    const text = req.body.text;

    if (!text) {
      return res.status(400).json({ error: 'Invalid request format. Missing  "text" in the request body.' });
    }

    const translation = await translate(text, { to: 'fr' });

    const translationRecord = new Translation({
      EnglishText: text,
      FrenchText: translation,
    });

    await translationRecord.save();

    res.json({ translation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
