// controllers/registrationForm.controller.js
import { StatusCodes } from "http-status-codes";
import { Record } from "../../startup/models.js";
import { generateApiResponse } from "../../services/utilities.service.js";
import { asyncHandler } from "../../services/asynchandler.js";

export const FormController = {
  submit: asyncHandler(async (req, res) => {
    let {
      companyName,
      contactPerson,
      email,
      phone,
      address,
      accountType,
      estimatedMonthlyShipments,
      interestedFeatures,
      comments,
      isSubmitted,
    } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Business email is required",
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ───────────────────────────────────────────────
    // 1. Prevent duplicate final submissions
    // ───────────────────────────────────────────────
    const alreadySubmitted = await Record.findOne({
      email: normalizedEmail,
      status: "submitted",
    });

    if (alreadySubmitted) {
      return generateApiResponse(
        res,
        StatusCodes.CONFLICT,
        false,
        "This email has already completed registration. You cannot submit again.",
        {
          recordId: alreadySubmitted._id,
          submittedAt: alreadySubmitted.submittedAt || alreadySubmitted.updatedAt,
        },
      );
    }

    // ───────────────────────────────────────────────
    // 2. Prepare sanitized data
    // ───────────────────────────────────────────────
    const data = {
      companyName: companyName?.trim() || undefined,
      contactPerson: contactPerson?.trim() || undefined,
      email: normalizedEmail,
      phone: phone?.trim() || undefined,
      address: address?.trim() || undefined,
      accountType: accountType?.trim() || undefined,
      estimatedMonthlyShipments: estimatedMonthlyShipments?.trim() || undefined,
      interestedFeatures: Array.isArray(interestedFeatures)
        ? interestedFeatures.map((f) => f.trim()).filter(Boolean)
        : [],
      comments: comments?.trim() || undefined,
      source: "web-form",
      status: "submitted",
      isSubmitted: true,
      submittedAt: new Date(),
    };

    Object.keys(data).forEach((key) => {
      if (data[key] === undefined || data[key] === "") {
        delete data[key];
      }
    });

    // ───────────────────────────────────────────────
    // 3. Required field validation
    // ───────────────────────────────────────────────
    const missing = [];
    if (!data.companyName) missing.push("companyName");
    if (!data.contactPerson) missing.push("contactPerson");
    if (!data.email) missing.push("email");
    if (!data.accountType) missing.push("accountType");
    if (!data.estimatedMonthlyShipments) missing.push("estimatedMonthlyShipments");
    if ((data.interestedFeatures?.length ?? 0) === 0) {
      missing.push("interestedFeatures (at least one required)");
    }

    if (missing.length > 0) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Missing required fields",
        { missingFields: missing },
      );
    }

    // ───────────────────────────────────────────────
    // 4. Save final record
    // ───────────────────────────────────────────────
    const record = new Record(data);
    await record.save();

    // ───────────────────────────────────────────────
    // 5. Success response
    // ───────────────────────────────────────────────
    return generateApiResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Registration submitted successfully! We'll contact you within 24 hours.",
      {
        recordId: record._id,
        email: record.email,
        status: record.status,
        submittedAt: record.submittedAt,
      },
    );
  }),
};
