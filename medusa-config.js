module.exports = {
  projectConfig: {
    // Other configurations
    paymentProviders: [
      {
        id: "manual",
        service: "@medusajs/payment-manual",
        is_installed: true,
      },
    ],
  },
};
