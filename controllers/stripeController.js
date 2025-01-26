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
// exports.createStripeWebhook = (req, res) => {
//   const rawBody = req.body; // Use raw body from middleware
//   const sig = req.headers["stripe-signature"];

//   let event;
//   try {
//     // Verify webhook signature
//     event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
//   } catch (err) {
//     console.error("Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Process Stripe event
//   switch (event.type) {
//     case "payment_intent.succeeded":
//       console.log("PaymentIntent succeeded:", event.data.object);
//       // Handle successful payment
//       break;
//     case "payment_intent.payment_failed":
//       console.log("PaymentIntent failed:", event.data.object);
//       // Handle failed payment
//       break;
//     default:
//       console.log(`Unhandled event type: ${event.type}`);
//   }

//   // Acknowledge receipt of the event
//   res.status(200).send("Webhook received successfully");
// };

/**
 * Health check endpoint
 * Endpoint: GET /
 */
exports.checkStripeHealth = (req, res) => {
  res.send("Stripe Payment Gateway API is running.");
};
