import { PayoutProvider } from "@medusajs/medusa";

class ManualPayoutProvider implements PayoutProvider {
  constructor(config) {
    // Initialize with any necessary configuration
  }

  async createPayout(order) {
    // Logic to create a manual payout
    console.log("Creating manual payout for order:", order);
  }

  async processPayout(payout) {
    // Logic to process a manual payout
    console.log("Processing manual payout:", payout);
  }

  async refundPayout(payout) {
    // Logic to refund a manual payout
    console.log("Refunding manual payout:", payout);
  }
}

export default ManualPayoutProvider;
