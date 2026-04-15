const path = require("path");

module.exports = {
  projectConfig: {
    // other configurations
    paymentProviders: [
      {
        id: "manual",
        serviceId: "@medusajs/payment-manual",
        isInstalled: true,
      },
      // other payment providers
    ],
  },
  database: {
    client: "sqlite3",
    connection: {
      filename: path.join(__dirname, "medusa-db.sqlite"),
    },
    useNullAsDefault: true,
  },
  // other configurations
};
