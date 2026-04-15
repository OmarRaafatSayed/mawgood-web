import { B2CProvider } from "@medusajs/medusa";

class ManualB2CProvider implements B2CProvider {
  constructor(config) {
    // Initialize with any necessary configuration
  }

  async createOrder(order) {
    // Logic to create a manual order
    console.log("Creating manual order:", order);
  }

  async processOrder(order) {
    // Logic to process a manual order
    console.log("Processing manual order:", order);
  }

  async cancelOrder(order) {
    // Logic to cancel a manual order
    console.log("Cancelling manual order:", order);
  }
}

export default ManualB2CProvider;
