"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const http_1 = __importDefault(require("http"));
const routes_1 = __importDefault(require("./routes"));
const dbConfig_1 = require("./config/dbConfig");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const corsOptions = {
    origin: true,
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
(0, routes_1.default)(app);
const PORT = process.env.API_PORT || 8500;
const server = http_1.default.createServer(app);
(0, dbConfig_1.connectToDatabase)().then(() => {
    module.exports = server.listen(PORT, () => {
        // initializeDB();
        // updateIndexes();
        console.log(`App listening on port ${PORT}!`);
    });
}).catch(err => {
    console.error('Failed to start server due to MongoDB connection error:', err);
    process.exit(1);
});
exports.default = { app };
