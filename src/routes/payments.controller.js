const { findCustomer } = require("../models/customer.model");
const {
  initiateCardPayment,
  inititiateFlutterwaveCardPayment,
  saveFlutterwaveResponse,
  findPayment,
  validatePaymentFlutterwave,
  verifyPaymentFlutterwave,
  getCustomerPayments,
} = require("../models/payments.model");
const { getPagination } = require("../services/utils");

const REDIRECT_URL = "https://owobilum.netlify.app";

async function httpInitiateChargeCard(req, res) {
  const {
    amount,
    card_number,
    currency,
    cvv,
    email,
    expiry_month,
    expiry_year,
    fullname,
  } = req.body;

  if (
    !amount ||
    !email ||
    !fullname ||
    !card_number ||
    !cvv ||
    !expiry_month ||
    !expiry_year
  ) {
    return res.status(400).json({ error: "missing required parameters" });
  }
  const customer = await findCustomer({ email });

  const payment = {
    amount: Number(amount),
    card_number,
    currency,
    customer,
    cvv,
    email,
    expiry_month,
    expiry_year,
    fullname,
  };

  const dbResponse = await initiateCardPayment(payment);

  const flwPaymentBody = {
    card_number: dbResponse.card_number,
    cvv: dbResponse.cvv,
    expiry_month: dbResponse.expiry_month,
    expiry_year: dbResponse.expiry_year,
    currency: dbResponse.currency,
    amount: dbResponse.amount,
    email: dbResponse.email,
    fullname: dbResponse.fullname,
    tx_ref: dbResponse._id,
    redirect_url: REDIRECT_URL,
  };

  const flwResponse = await inititiateFlutterwaveCardPayment(flwPaymentBody);

  if (flwResponse.status !== "success") {
    return res.status(400).json({
      error: flwResponse?.data?.message || "Issue with 3rd party service",
    });
  }

  const savedDoc = await saveFlutterwaveResponse(dbResponse._id, flwResponse);

  if (savedDoc.status !== "success") {
    return res.status(502).json({
      error: savedDoc?.data?.message || "Error saving to DB",
    });
  }

  if (flwResponse?.data?.meta?.authorization?.mode !== "pin") {
    return res
      .status(400)
      .json({ error: "unsupported card authorization mode" });
  }

  res.status(200).json({
    message: "Payment initiated successfully. Card PIN required to proceed.",
    data: { payment_id: savedDoc.data },
  });
}

async function httpSendCardPin(req, res) {
  const { payment_id, pin } = req.body;

  if (!payment_id || !pin) {
    return res.status(400).json({ error: "missing required parameters" });
  }

  const payment = await findPayment(payment_id);

  const flwPaymentBody = {
    card_number: payment.card_number,
    cvv: payment.cvv,
    expiry_month: payment.expiry_month,
    expiry_year: payment.expiry_year,
    currency: payment.currency,
    amount: payment.amount,
    email: payment.email,
    fullname: payment.fullname,
    tx_ref: payment._id,
    redirect_url: REDIRECT_URL,
    authorization: {
      mode: "pin",
      pin,
    },
  };

  const flwResponse = await inititiateFlutterwaveCardPayment(flwPaymentBody);

  if (flwResponse.status !== "success") {
    return res.status(400).json({
      error: flwResponse?.data?.message || "Issue with 3rd party service",
    });
  }

  const savedDoc = await saveFlutterwaveResponse(payment_id, flwResponse);

  if (savedDoc.status !== "success") {
    return res.status(502).json({
      error: savedDoc?.data?.message || "Error saving to DB",
    });
  }

  res.status(200).json({
    status: flwResponse.data.status,
    message: flwResponse.data.data.processor_response,
    data: { payment_id },
  });
}

async function httpValidateCardPayment(req, res) {
  const { payment_id, otp } = req.body;

  if (!payment_id || !otp) {
    return res.json(400).json({
      error: "missing required parameters",
    });
  }

  const payment = await findPayment(payment_id);

  if (!payment?.flutterwave?.data?.data?.flw_ref) {
    return res.status(400).json({ error: "Invalid payment" });
  }

  const validateBody = {
    otp,
    flw_ref: payment.flutterwave.data.data.flw_ref,
    type: "card",
  };

  const flwResponse = await validatePaymentFlutterwave(validateBody);

  if (flwResponse.status !== "success") {
    return res.status(400).json({
      error: flwResponse?.data?.message || "Issue with 3rd party service",
    });
  }

  const savedDoc = await saveFlutterwaveResponse(payment_id, flwResponse);

  if (savedDoc.status !== "success") {
    return res.status(502).json({
      error: savedDoc?.data?.message || "Error saving to DB",
    });
  }

  return res.status(200).json({
    status: flwResponse.data.status,
    message: flwResponse.data.data.processor_response,
    data: { payment_id },
  });
}

async function httpVerifyCardPayment(req, res) {
  const { id: payment_id } = req.params;

  if (!payment_id) {
    return res.json(400).json({
      error: "missing required parameter(s)",
    });
  }

  const payment = await findPayment(payment_id);

  const id = payment?.flutterwave?.data?.data?.id;

  if (!id) {
    return res.status(400).json({ error: "Invalid payment" });
  }

  const flwResponse = await verifyPaymentFlutterwave(id);

  if (flwResponse.status !== "success") {
    return res.status(400).json({
      error: flwResponse?.data?.message || "Issue with 3rd party service",
    });
  }

  const savedDoc = await saveFlutterwaveResponse(payment_id, flwResponse, true);

  if (savedDoc.status !== "success") {
    return res.status(502).json({
      error: savedDoc?.data?.message || "Error saving to DB",
    });
  }

  return res.status(200).json({
    status: flwResponse.data.status,
    message: flwResponse.data.data.processor_response,
  });
}

async function httpGetCustomerPayments(req, res) {
  const { customerId } = req.params;
  const { skip, limit } = getPagination(req.query);
  const payments = await getCustomerPayments(customerId, { skip, limit });

  if (!payments) {
    return res.status(502).json({ error: "server error" });
  }

  return res.status(200).json({ message: "success", data: { payments } });
}

module.exports = {
  httpInitiateChargeCard,
  httpSendCardPin,
  httpValidateCardPayment,
  httpVerifyCardPayment,
  httpGetCustomerPayments,
};
