const Stripe = require("stripe");
const express = require("express");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Create a payment intent
 * Endpoint: POST /create-payment-intent
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    // Create a PaymentIntent with the specified amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in smallest currency unit (e.g., cents for USD)
      currency,
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret, // Send the client secret to the client
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Webhook endpoint for Stripe events
 * Endpoint: POST /webhook
 */
exports.createStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = webhookSecret; // Stripe Webhook Secret
  let event;

  // Verify webhook signature using the raw body
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Error verifying webhook signature:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle different types of events
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      const paymentIntent = session.payment_intent;

      try {
        const paymentIntentDetails = await stripe.paymentIntents.retrieve(
          paymentIntent
        );
        if (paymentIntentDetails.status === "succeeded") {
          console.log("Payment successful:", paymentIntentDetails);
        } else {
          console.log("Payment failed:", paymentIntentDetails);
        }
      } catch (err) {
        console.error("Error retrieving payment intent:", err);
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

exports.createPaymentLink = async (req, res) => {
  try {
    const { amount, currency, description, quantity } = req.body;

    // Create a Product dynamically
    const product = await stripe.products.create({
      name: description || "Payment",
    });

    // Create a Price dynamically
    const price = await stripe.prices.create({
      unit_amount: amount,
      currency: currency || "usd",
      product: product.id,
    });

    // Create a Payment Link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: quantity || 1,
        },
      ],
    });

    // Respond with the payment link URL
    res.status(200).json({
      success: true,
      url: paymentLink.url,
    });
  } catch (error) {
    console.error("Error creating payment link:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Health check endpoint
 * Endpoint: GET /
 */
exports.checkStripeHealth = (req, res) => {
  res.send("Stripe Payment Gateway API is running.");
};
