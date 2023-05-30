const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    completed: { type: Boolean, required: true, default: false },
    card_number: { type: String, required: true },
    currency: { type: String, default: "NGN" },
    customer: { type: mongoose.Types.ObjectId, ref: "Customer" },
    cvv: { type: String, required: true },
    email: { type: String, required: true },
    expiry_month: { type: String, required: true },
    expiry_year: { type: String, required: true },
    flutterwave: { type: Object, required: false },
    fullname: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);

// you'll have a payments/create endpoint. Save the payment to payment collection, then use the response to add the payment to that customer's
// payment array
