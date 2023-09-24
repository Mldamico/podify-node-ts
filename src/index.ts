import express from 'express';
import 'dotenv/config'
import "./db"

const app = express();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log('Port is listening in ' + PORT)
})