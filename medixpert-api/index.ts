import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import fs from 'fs';
import routes from './routes';
import { connectToDatabase } from './config/dbConfig';
import dotenv from 'dotenv';
import initializeDB from './config/db';
dotenv.config();

const app = express();
const corsOptions = {
  origin: true,
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routes(app);

const PORT = process.env.API_PORT || 8500;

const server = http.createServer(app);

connectToDatabase().then(() => {
    module.exports = server.listen(PORT, () => {
        // initializeDB();
        console.log(`App listening on port ${PORT}!`);
    });
}).catch(err => {
    console.error('Failed to start server due to MongoDB connection error:', err);
    process.exit(1);
});

export default { app };
