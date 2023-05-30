const express = require("express");

const {
  httpCreateCustomer,
  httpGetCustomer,
  httpGetAllCustomers,
} = require("./customer.controller");

const customerRouter = express.Router();

customerRouter.post("/create", httpCreateCustomer);
customerRouter.get("/all", httpGetAllCustomers);
customerRouter.get("/:customerId", httpGetCustomer);

module.exports = customerRouter;
