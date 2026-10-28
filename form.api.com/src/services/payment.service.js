import axios from "axios";

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════=======
// MyFatoorah Service
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════=======

const MY_FATOORAH_HOST = process.env.MY_FATOORAH_HOST;
const MY_FATOORAH_API_KEY = process.env.MY_FATOORAH_API_KEY;

const axiosInstance = axios.create({
  baseURL: MY_FATOORAH_HOST,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${MY_FATOORAH_API_KEY}`,
  },
});

/**
 * Initialize a payment with MyFatoorah.
 * @param {number} amount - The invoice amount.
 * @returns {Promise<Object>} - The API response data.
 */
export const initPayment = async (amount) => {
  try {
    const response = await axiosInstance.post("/InitiatePayment", {
      InvoiceAmount: amount,
      CurrencyIso: "KWD",
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error in initPayment:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Execute a payment using MyFatoorah.
 * @param {number} amount - The invoice amount.
 * @param {number} paymentMethodId - The payment method ID.
 * @param {string} name - Customer's name.
 * @param {string} email - Customer's email.
 * @returns {Promise<Object>} - The API response data.
 */
export const executeMyFatoorahPayment = async (
  amount,
  paymentMethodId,
  name,
  email,
  web = false
) => {
  try {
    const payload = {
      InvoiceValue: amount,
      PaymentMethodId: paymentMethodId ?? 2,
      DisplayCurrencyIso: "KWD",
      CustomerName: name,
      CustomerEmail: email,
    };

    if (web) {
      const baseUrl = process.env.CONNECT_WEB_URL;
      payload.CallBackUrl = `${baseUrl}/success-payment`;
      payload.ErrorUrl = `${baseUrl}/error-payment`;
    }

    const response = await axiosInstance.post("/ExecutePayment", payload);
    return response.data;
  } catch (error) {
    console.error(
      "Error in executeMyFatoorahPayment:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Check the payment status using MyFatoorah.
 * @param {string} value - The key value to identify the payment.
 * @param {string} type - The type of key (e.g., InvoiceId, PaymentId).
 * @returns {Promise<Object>} - The API response data.
 */
export const checkMyFatoorahPaymentStatus = async (value, type) => {
  console.log(value, type);
  try {
    const response = await axiosInstance.post("/GetPaymentStatus", {
      Key: value,
      KeyType: type,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error in checkMyFatoorahPaymentStatus:",
      error.response?.data || error.message
    );
    throw error;
  }
};
