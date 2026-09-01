import { stripeClient } from "../config/stripe.js";
import { prisma } from "../config/prisma.js";

const PREMIUM_PRICE = 599;
const PREMIUM_CURRENCY = "INR";

async function resolveStripeCustomer(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return { error: { status: 404, message: "User not found" } };
  }

  if (user.stripeCustomerId) {
    return { user, customerId: user.stripeCustomerId };
  }

  const customer = await stripeClient.customers.create({
    name: user.name,
    email: user.email,
    metadata: { userId: user.id },
  });

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return { user: updatedUser, customerId: customer.id };
}

export const addNewCard = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).send({
        success: false,
        message: "User not authenticated",
      });
    }

    const { card_token } = req.body;
    if (!card_token) {
      return res.status(400).send({
        success: false,
        message: "card_token is required",
      });
    }

    const { customerId, error } = await resolveStripeCustomer(userId);
    if (error) {
      return res.status(error.status).send({
        success: false,
        message: error.message,
      });
    }

    const card = await stripeClient.customers.createSource(customerId, {
      source: card_token,
    });

    return res.status(200).send({
      success: true,
      message: "Card added successfully",
      data: {
        card_id: card.id,
        last4: card.last4,
        brand: card.brand,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
      },
    });
  } catch (error) {
    console.error("Error adding card:", error);

    if (error.type === "StripeCardError") {
      return res.status(400).send({
        success: false,
        message: error.message || "Card was declined",
        error: error.message,
      });
    }

    return res.status(500).send({
      success: false,
      message: "Error adding card",
      error: error.message,
    });
  }
};

export const createCharges = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).send({
        success: false,
        message: "User not authenticated",
      });
    }

    const { card_id } = req.body;
    if (!card_id) {
      return res.status(400).send({
        success: false,
        message: "card_id is required",
      });
    }

    const { user, customerId, error } = await resolveStripeCustomer(userId);
    if (error) {
      return res.status(error.status).send({
        success: false,
        message: error.message,
      });
    }

    const createCharge = await stripeClient.charges.create({
      receipt_email: user.email || req.user.email,
      amount: PREMIUM_PRICE * 100,
      currency: PREMIUM_CURRENCY,
      customer: customerId,
      source: card_id,
      description: `Premium plan purchase for customer ${customerId}`,
    });

    if (createCharge.status === "succeeded") {
      await prisma.user.update({
        where: { id: user.id },
        data: { plan: "PREMIUM" },
      });
    }

    const cardDetails = createCharge.payment_method_details?.card;
    const outcome = createCharge.outcome;

    return res.status(200).send({
      success: true,
      message: "Payment successful",
      data: {
        charge_id: createCharge.id,
        amount: createCharge.amount / 100,
        currency: createCharge.currency?.toUpperCase(),
        status: createCharge.status,
        paid: createCharge.paid,
        receipt_url: createCharge.receipt_url,
        receipt_email: createCharge.receipt_email,
        created: createCharge.created,

        payment_method: cardDetails
          ? {
              brand: cardDetails.brand,
              last4: cardDetails.last4,
              exp_month: cardDetails.exp_month,
              exp_year: cardDetails.exp_year,
              country: cardDetails.country,
              funding: cardDetails.funding,
            }
          : null,

        outcome: outcome
          ? {
              network_status: outcome.network_status,
              risk_level: outcome.risk_level,
              seller_message: outcome.seller_message,
              type: outcome.type,
            }
          : null,

        customer: createCharge.customer,
        plan_updated: createCharge.status === "succeeded" ? "PREMIUM" : null,
        balance_transaction: createCharge.balance_transaction,
        description: createCharge.description,
      },
    });
  } catch (error) {
    console.error("Error creating charge:", error);

    if (error.type === "StripeCardError") {
      return res.status(400).send({
        success: false,
        message: error.message || "Card was declined",
        error: error.message,
      });
    }

    return res.status(500).send({
      success: false,
      message: "Error creating charge",
      error: error.message,
    });
  }
};
