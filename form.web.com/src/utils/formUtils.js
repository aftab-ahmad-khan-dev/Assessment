
export const formValidationRules = {
  companyName: {
    required: true,
    message: "Company name is required",
    normalize: (v) => v.trim(),
  },
  contactPerson: {
    required: true,
    message: "Contact person is required",
    normalize: (v) => v.trim(),
  },
  email: {
    required: true,
    message: "Business email is required",
    validate: (v) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        return "Please enter a valid email address";
      }
      return null;
    },
    normalize: (v) => v.trim().toLowerCase(),
  },
  phone: {
    required: false,
    validate: (v) => {
      if (!v) return null;
      const digits = v.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        return "Phone number should contain 7–15 digits";
      }
      if (!v.startsWith("+")) {
        return "Phone number should start with country code (e.g. +92, +1)";
      }
      return null;
    },
    normalize: normalizePhone,
  },
  address: {
    required: false,
    normalize: (v) => v.trim(),
  },
  accountType: {
    required: true,
    message: "Please select an account type",
  },
  estimatedMonthlyShipments: {
    required: true,
    message: "Please select estimated monthly shipments",
  },
  interestedFeatures: {
    required: true,
    validate: (v) =>
      Array.isArray(v) && v.length > 0 ? null : "Please select at least one feature",
  },
  comments: {
    required: false,
    normalize: (v) => v.trim(),
  },
};

function normalizePhone(input) {
  if (!input || typeof input !== "string") return "";

  let cleaned = input.replace(/[^0-9+]/g, "");

  if (!cleaned.startsWith("+")) {
    if (/^03[0-9]{9}$/.test(cleaned)) {
      cleaned = "+92" + cleaned.substring(1);
    } else if (/^[2-9][0-9]{9}$/.test(cleaned)) {
      cleaned = "+1" + cleaned;
    } else if (/^1[2-9][0-9]{9}$/.test(cleaned)) {
      cleaned = "+" + cleaned;
    }
  }

  if (cleaned && !cleaned.startsWith("+") && /[0-9]/.test(cleaned)) {
    cleaned = "+" + cleaned;
  }

  return cleaned;
}

export function validateFormData(data) {
  const errors = {};

  for (const [field, rules] of Object.entries(formValidationRules)) {
    const value = data[field];

    // Required check
    if (
      rules.required &&
      (value == null || value === "" || (Array.isArray(value) && value.length === 0))
    ) {
      errors[field] = rules.message;
      continue;
    }

    // Custom validation
    if (rules.validate) {
      const error = rules.validate(value);
      if (error) {
        errors[field] = error;
      }
    }
  }

  return errors;
}

export function normalizeFormData(data) {
  const normalized = { ...data };

  for (const [field, rules] of Object.entries(formValidationRules)) {
    if (rules.normalize && normalized[field] != null) {
      normalized[field] = rules.normalize(normalized[field]);
    }
  }

  return normalized;
}

export function getCleanedSubmitData(rawData) {
  const normalized = normalizeFormData(rawData);
  return {
    ...normalized,
    companyName: (normalized.companyName || "").trim(),
    contactPerson: (normalized.contactPerson || "").trim(),
    email: (normalized.email || "").trim().toLowerCase(),
    phone: (normalized.phone || "").trim(),
    address: (normalized.address || "").trim(),
    comments: (normalized.comments || "").trim(),
  };
}
