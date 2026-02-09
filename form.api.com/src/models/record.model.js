// models/Registration.js or models/Record.js (your choice)
import mongoose, { Schema } from "mongoose";

const recordSchema = new Schema(
  {
    // === Business & Contact Info (from form) ===
    companyName: {
      type: String,
      trim: true,
      required: [true, "Company name is required"],
      maxlength: 200,
    },
    contactPerson: {
      type: String,
      trim: true,
      required: [true, "Contact person name is required"],
      maxlength: 120,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Business email is required"],
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?\d{7,15}$/, "Please enter a valid phone number"] || true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },

    // === Account Preferences ===
    accountType: {
      type: String,
      enum: ["Starter / Trial", "Small Business", "Enterprise", "Logistics Partner"],
      required: [true, "Account type is required"],
    },
    estimatedMonthlyShipments: {
      type: String,
      enum: ["0–50", "51–200", "201–1000", "1000+"],
      required: [true, "Estimated monthly shipments is required"],
    },
    interestedFeatures: {
      type: [String],
      enum: [
        "Smart OCR Sticker Scanning",
        "Automated Data Extraction",
        "Real-time Analytics Dashboard",
        "Multi-user Team Access",
        "API Integration",
        "Custom Reporting",
      ],
      required: [true, "Please select at least one interested feature"],
      validate: {
        validator: function (arr) {
          return arr.length >= 1;
        },
        message: "At least one feature must be selected",
      },
    },

    // === Additional ===
    comments: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },

    // === Metadata ===
    source: {
      type: String,
      enum: ["web-form", "manual", "api"],
      default: "web-form",
    },
    status: {
      type: String,
      enum: ["submitted", "pending", "contacted", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    isSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for fast queries
recordSchema.index({ email: 1 });
recordSchema.index({ status: 1, createdAt: -1 });
recordSchema.index({ accountType: 1 });
recordSchema.index({ estimatedMonthlyShipments: 1 });

export default mongoose.model("Record", recordSchema);
