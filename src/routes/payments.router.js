const express = require("express");

const {
  httpInitiateChargeCard,
  httpSendCardPin,
  httpValidateCardPayment,
  httpVerifyCardPayment,
  httpGetCustomerPayments,
} = require("./payments.controller");

const paymentsRouter = express.Router();

paymentsRouter.post("/charge-card/initiate", httpInitiateChargeCard);
paymentsRouter.post("/charge-card/send-pin", httpSendCardPin);
paymentsRouter.post("/charge-card/validate", httpValidateCardPayment);
paymentsRouter.get("/charge-card/verify/:id", httpVerifyCardPayment);
paymentsRouter.get("/customer/:customerId", httpGetCustomerPayments);

module.exports = paymentsRouter;
