class paymentModel {
  constructor(payment) {
    this.user_id = payment.user_id;
    this.property_id = payment.property_id;
    this.total_price = payment.total_price;
    this.amount_paid = payment.amount_paid;
    this.payment_method = payment.payment_method;
    this.payment_details = payment.payment_details;
    this.status = payment.status;
    this.payment_date = payment.payment_date || new Date();
    this.invoice_number = payment.invoice_number;
    this.is_deposit = payment.is_deposit || false;
  }

  // Validate payment model
  validate() {
    if (
      !this.user_id ||
      !this.property_id ||
      !this.amount_paid ||
      !this.payment_method ||
      !this.payment_details ||
      !this.status
    ) {
      return {
        valid: false,
        message: "All payment fields are required",
      };
    }

    // Validate payment method
    const validMethods = ["credit_card", "upi", "razorpay"];
    if (!validMethods.includes(this.payment_method)) {
      return {
        valid: false,
        message: "Only credit card, UPI, and Razorpay payments are accepted",
      };
    }

    // Validate payment details based on method
    if (this.payment_method === "credit_card") {
      const { card_holder, card_number, expiry_date, cvv } =
        this.payment_details;
      if (!card_holder || !card_number || !expiry_date || !cvv) {
        return {
          valid: false,
          message: "All credit card details are required",
        };
      }
    } else if (this.payment_method === "upi") {
      const { upi_id } = this.payment_details;
      if (!upi_id) {
        return {
          valid: false,
          message: "UPI ID is required for UPI payments",
        };
      }
    } else if (this.payment_method === "razorpay") {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
        this.payment_details;
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return {
          valid: false,
          message: "All Razorpay payment details are required",
        };
      }
    }

    // Validate deposit payment logic
    if (this.is_deposit && (!this.total_price || this.total_price <= 0)) {
      return {
        valid: false,
        message: "Total price is required for deposit payments",
      };
    }

    return { valid: true };
  }

  // Calculate deposit amount (10% of total)
  calculateDepositAmount() {
    if (!this.total_price) return 0;
    return Math.round(this.total_price * 0.1);
  }
}

export default paymentModel;
