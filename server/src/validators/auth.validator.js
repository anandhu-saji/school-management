export const loginSchema = {
  body: {
    email: {
      required: true,
      email: true,
      message: "A valid email address is required.",
    },
    password: {
      required: true,
      message: "Password is required.",
    },
  },
};

export const forgotPasswordSchema = {
  body: {
    email: {
      required: true,
      email: true,
      message: "Registered account email is required.",
    },
  },
};

export const verifyOtpSchema = {
  body: {
    email: {
      required: true,
      email: true,
      message: "Email is required.",
    },
    otp: {
      required: true,
      message: "OTP verification code is required.",
    },
  },
};

export const resetPasswordSchema = {
  body: {
    email: {
      required: true,
      email: true,
      message: "Email is required.",
    },
    otp: {
      required: true,
      message: "OTP verification code is required.",
    },
    newPassword: {
      required: true,
      minLength: 6,
      message: "New password must be at least 6 characters long.",
    },
  },
};
