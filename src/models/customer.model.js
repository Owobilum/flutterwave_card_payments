const customers = require("./customer.mongo");

async function addCustomer(customer) {
  try {
    const response = await customers.create(customer);
    return response;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function findCustomer(customer) {
  const foundCustomer = await customers.findOne({ email: customer.email });
  return foundCustomer;
}

async function isExistingCustomer(customer) {
  const foundCustomer = await findCustomer(customer);
  if (foundCustomer) {
    return true;
  } else {
    return false;
  }
}

async function findCustomerById(id) {
  try {
    const customer = await customers.findById(id).populate("payments");
    return customer;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function getAllCustomers(skip, limit) {
  try {
    const foundcustomers = await customers
      .find({}, { __v: 0 })
      .sort({ createdAt: -1 }) // sort in descending order of creation date
      .skip(skip)
      .limit(limit);
    return foundcustomers;
  } catch (error) {
    console.error(e);
    return false;
  }
}

module.exports = {
  addCustomer,
  isExistingCustomer,
  findCustomer,
  findCustomerById,
  getAllCustomers,
};
