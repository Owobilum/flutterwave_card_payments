const express = require("express");

const {
  httpCreateCustomer,
  httpGetCustomer,
  httpGetAllCustomers,
  httpGetCustomerAndPayments,
} = require("./customer.controller");

const customerRouter = express.Router();

customerRouter.post("/create", httpCreateCustomer);
customerRouter.get("/all", httpGetAllCustomers);
customerRouter.get("/:customerId", httpGetCustomer);
customerRouter.get("/:customerId/payments", httpGetCustomerAndPayments);

module.exports = customerRouter;
