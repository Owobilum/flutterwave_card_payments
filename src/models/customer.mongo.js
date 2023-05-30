const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    payments: [{ type: mongoose.Types.ObjectId, ref: "Payment" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
