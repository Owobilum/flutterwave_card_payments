const {
  addCustomer,
  isExistingCustomer,
  findCustomerById,
  getAllCustomers,
  getCustomerAndPayments
} = require("../models/customer.model");
const { getPagination } = require("../services/utils");

async function httpCreateCustomer(req, res) {
  const { firstname, lastname, email, phone } = req.body;

  if (!firstname || !lastname || !email || !phone) {
    return res.status(400).json({ error: "missing required parameters" });
  }
  const customerDetails = {
    firstname,
    lastname,
    email,
    phone,
  };

  try {
    const customerExists = await isExistingCustomer(customerDetails);
    if (customerExists) {
      return res.status(400).json({ error: "customer already exists" });
    }
    const customer = await addCustomer(customerDetails);
    if (customer) {
      res.status(201).json(customer);
    } else {
      res
        .status(400)
        .json({ error: "error saving customer. Please try again." });
    }
  } catch (e) {
    console.error(e);
  }
}

async function httpGetCustomer(req, res) {
  const { customerId } = req.params;

  try {
    const customer = await findCustomerById(customerId);
    if (!customer) {
      return res.status(400).json({ error: "could not find customer" });
    }

    return res.status(200).json({ customer });
  } catch (error) {
    console.error(error);
  }

  return res.status(500).json({ error: "Server error" });
}

async function httpGetAllCustomers(req, res) {
  const { skip, limit } = getPagination(req.query);
  const customers = await getAllCustomers(skip, limit);

  if (!customers) {
    return res.status(502).json({ error: "could not fetch data" });
  }

  return res.status(200).json({ message: "success", data: { customers } });
}

async function httpGetCustomerAndPayments(req, res){
  const {customerId} = req.params
  const customer = await getCustomerAndPayments(customerId)
  if (!customer) {
    return res.status(502).json({ error: "could not fetch data" });
  }

  return res.status(200).json({ message: "success", data: { customer } });

}

module.exports = { httpCreateCustomer, httpGetCustomer, httpGetAllCustomers,httpGetCustomerAndPayments };
