
import express from 'express';
import 'dotenv/config'
import "./db"

const app = express();

const PORT = 4444;

app.listen(PORT, () => {
    console.log('Port is listening in ' + PORT)
})