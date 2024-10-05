// Global access to environment variables
require("dotenv").config();

// Main server libraries
const express = require("express");
const cors = require("cors");
const app = express();
const IP = require("ip");

// Cors
app.use(cors()); 

// routes
const routes = require("./routes/routes");
app.use("/", routes);

// Server info
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`server is listening on port ${port} and localhost ${IP.address()}`));