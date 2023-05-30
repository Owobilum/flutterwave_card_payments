require("dotenv").config();
const express = require("express");

const customerRouter = require("./routes/customer.router");
const paymentsRouter = require("./routes/payments.router");

const app = express();

app.use(express.json());

app.use("/customer", customerRouter);
app.use("/payments", paymentsRouter);

module.exports = app;
