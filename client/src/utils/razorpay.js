/**
 * Asynchronously loads the official Razorpay Checkout SDK script
 * @returns {Promise<boolean>} Resolves true if loaded successfully
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn("[Razorpay] Failed to load external checkout script (e.g. offline environment).");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Returns the configured Razorpay public key ID
 */
export const getRazorpayKeyId = () => {
  return (
    import.meta.env.VITE_RAZORPAY_KEY_ID ||
    "rzp_test_school_gateway_2026"
  );
};
