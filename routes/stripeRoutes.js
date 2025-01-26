// routes/stripeRoutes.js
const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const stripeController = require("../controllers/stripeController");

// Route to create and send the payment intent
router.post("/create-payment-intent", stripeController.createPaymentIntent);

// Webhook route: use bodyParser.raw for Stripe's raw body requirements
router.post("/webhook", bodyParser.raw({ type: 'application/json' }), stripeController.createStripeWebhook);

router.post("/create-payment-link", stripeController.createPaymentLink);

// Route to check Stripe API health
router.get("/", stripeController.checkStripeHealth);

module.exports = router;
