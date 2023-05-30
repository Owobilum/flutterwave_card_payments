const axios = require("axios");

const { handleError } = require("../services/utils");
const payments = require("./payments.mongo");
const { findCustomer } = require("./customer.model");

const token = process.env.FLUTTERWAVE_SECRET_KEY || "";
const encryptionKey = process.env.FLUTTERWAVE_ENCRYPTION_KEY || "";

const config = {
  headers: { Authorization: `Bearer ${token}` },
  "Content-Type": "application/json",
};

async function initiateCardPayment(payment) {
  try {
    const storedPayment = await payments.create(payment);
    const customer = await findCustomer({ email: payment.email });
    customer.payments.push(storedPayment);
    await customer.save();

    return storedPayment;
  } catch (e) {
    console.error(e);
  }
}

function encrypt(encryptionKey, payload) {
  const text = JSON.stringify(payload);
  const forge = require("node-forge");
  const cipher = forge.cipher.createCipher(
    "3DES-ECB",
    forge.util.createBuffer(encryptionKey)
  );
  cipher.start({ iv: "" });
  cipher.update(forge.util.createBuffer(text, "utf-8"));
  cipher.finish();
  const encrypted = cipher.output;
  return forge.util.encode64(encrypted.getBytes());
}

async function inititiateFlutterwaveCardPayment(payment) {
  console.log("Calling Flutterwave...");
  try {
    const response = await axios.post(
      "https://api.flutterwave.com/v3/charges?type=card",
      {
        client: encrypt(encryptionKey, payment),
      },
      config
    );
    return { status: "success", data: response.data };
  } catch (error) {
    console.error(error?.response?.data);
    return { status: "error", data: error?.response?.data };
  }
}

async function saveFlutterwaveResponse(paymentId, flwResponse, isCompleted) {
  try {
    await payments.updateOne(
      {
        _id: paymentId,
      },
      {
        flutterwave: flwResponse,
        completed: isCompleted ? true : false,
      }
    );

    return { status: "success", data: paymentId };
  } catch (e) {
    console.error(error?.response?.data);
    return { status: "error", data: error?.response?.data };
  }
}

async function findPayment(paymentId) {
  try {
    const payment = await payments.findById(paymentId);
    return payment;
  } catch (error) {
    return handleError(error);
  }
}

async function validatePaymentFlutterwave(body) {
  try {
    const response = await axios.post(
      "https://api.flutterwave.com/v3/validate-charge",
      body,
      config
    );
    return { status: "success", data: response.data };
  } catch (error) {
    return handleError(error);
  }
}

async function verifyPaymentFlutterwave(id) {
  try {
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${id}/verify`,
      config
    );
    return { status: "success", data: response.data };
  } catch (error) {
    return handleError(error);
  }
}

async function getCustomerPayments(customerId, pagination) {
  try {
    const customerPayments = await payments
      .find(
        {
          customer: customerId,
        },
        { __v: 0 }
      )
      .skip(pagination.skip)
      .limit(pagination.limit);
    return customerPayments;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  initiateCardPayment,
  inititiateFlutterwaveCardPayment,
  saveFlutterwaveResponse,
  findPayment,
  validatePaymentFlutterwave,
  verifyPaymentFlutterwave,
  getCustomerPayments,
};
