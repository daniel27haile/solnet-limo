const axios = require('axios');
const { randomUUID } = require('crypto');
const env = require('../config/env');

const SQUARE_BASE_URL =
  env.SQUARE_ENVIRONMENT === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';

const squareHeaders = () => ({
  Authorization: `Bearer ${env.SQUARE_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
  'Square-Version': '2024-06-04',
});

const createPayment = async ({ sourceId, amountCents, currency, note, customerEmail }) => {
  if (!env.SQUARE_ACCESS_TOKEN) {
    throw new Error('Square payment is not configured on the server.');
  }
  if (!env.SQUARE_LOCATION_ID) {
    throw new Error('Square location ID is not configured on the server.');
  }

  const body = {
    source_id: sourceId,
    idempotency_key: randomUUID(),
    amount_money: {
      amount: amountCents, // Square expects integer cents
      currency: currency || 'USD',
    },
    location_id: env.SQUARE_LOCATION_ID,
    note: note || 'Solnet Limo booking',
    buyer_email_address: customerEmail,
  };

  const response = await axios.post(`${SQUARE_BASE_URL}/v2/payments`, body, {
    headers: squareHeaders(),
    timeout: 15000,
  });

  const payment = response.data?.payment;
  return {
    squarePaymentId: payment?.id,
    status: payment?.status,
    amountMoney: payment?.amount_money,
  };
};

module.exports = { createPayment };
