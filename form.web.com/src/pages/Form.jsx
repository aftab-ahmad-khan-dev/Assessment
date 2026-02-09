// src/pages/Form.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/UI/Button.jsx";
import { useApi } from "../context/ApiContext.jsx";

import {
  formValidationRules,
  validateFormData,
  getCleanedSubmitData,
} from "../utils/formUtils";

const Form = () => {
  const { submitForm } = useApi();

  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    accountType: "",
    estimatedMonthlyShipments: "",
    interestedFeatures: [],
    comments: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        interestedFeatures: checked
          ? [...prev.interestedFeatures, value]
          : prev.interestedFeatures.filter((item) => item !== value),
      }));
      if (errors.interestedFeatures) {
        setErrors((prev) => ({ ...prev, interestedFeatures: undefined }));
      }
      return;
    }

    // Normalize on change (helps with phone formatting in real-time)
    const rule = formValidationRules[name];
    const normalizedValue = rule?.normalize ? rule.normalize(value) : value;

    setFormData((prev) => ({ ...prev, [name]: normalizedValue }));

    // Clear error when user starts typing / changing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedData = getCleanedSubmitData(formData);
    setFormData(cleanedData); 

    const validationErrors = validateFormData(cleanedData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please correct the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitForm(cleanedData);

      const isSuccess =
        result?.isSubmitted === true ||
        result?.success === true ||
        result?.status?.toLowerCase() === "success" ||
        result?.submitted === true ||
        result?.message?.toLowerCase()?.includes("success") ||
        result?.message?.toLowerCase()?.includes("submitted") ||
        result?.message?.toLowerCase()?.includes("thank you");

      if (isSuccess) {
        toast.success(
          "Thank you! Your registration has been submitted. We'll contact you within 24 hours.",
          { duration: 7000 },
        );

        // Reset form
        setFormData({
          companyName: "",
          contactPerson: "",
          email: "",
          phone: "",
          address: "",
          accountType: "",
          estimatedMonthlyShipments: "",
          interestedFeatures: [],
          comments: "",
        });
        setErrors({});
      } else {
        const errorMsg =
          result?.message ||
          result?.error ||
          "Submission received but we couldn't confirm success. Please try again.";
        toast.error(errorMsg, { duration: 8000 });
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message ||
        "Failed to submit form. Please check your connection and try again.";
      toast.error(message, { duration: 6000 });
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountTypes = [
    "Starter / Trial",
    "Small Business",
    "Enterprise",
    "Logistics Partner",
  ];

  const shipmentRanges = ["0–50", "51–200", "201–1000", "1000+"];

  const featuresList = [
    "Smart OCR Sticker Scanning",
    "Real-time Analytics Dashboard",
    "Automated Data Extraction",
    "Multi-user Team Access",
    "API Integration",
    "Custom Reporting",
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden py-8 px-4'>
      {/* Background effects */}
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className='absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl -z-10'
      />
      <motion.div
        animate={{ rotate: -360, scale: [1, 1.12, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className='absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-full blur-3xl -z-10'
      />

      <div className='relative z-10 max-w-5xl mx-auto'>
        <div className='text-center mb-10'>
          <h1 className='text-4xl sm:text-5xl font-bold text-white mb-3'>
            Business <span className='text-cyan-400'>Registration</span>
          </h1>
          <p className='text-blue-200 text-lg max-w-2xl mx-auto'>
            Tell us about your business. We'll get back to you within 24 hours.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className='bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-3xl mx-auto'
        >
          <form onSubmit={handleSubmit} className='space-y-8 pointer-events-auto'>
            {/* Company & Contact */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-white mb-1.5'>
                  Company Name <span className='text-red-400'>*</span>
                </label>
                <input
                  type='text'
                  name='companyName'
                  value={formData.companyName}
                  onChange={handleChange}
                  maxLength={26}
                  className='w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 px-4 py-3 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all'
                  placeholder='e.g. ABC Logistics'
                />
                {errors.companyName && (
                  <p className='mt-1 text-xs text-red-400'>{errors.companyName}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-white mb-1.5'>
                  Contact Person <span className='text-red-400'>*</span>
                </label>
                <input
                  type='text'
                  name='contactPerson'
                  value={formData.contactPerson}
                  onChange={handleChange}
                  maxLength={30}
                  className='w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 px-4 py-3 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all'
                  placeholder='Full name'
                />
                {errors.contactPerson && (
                  <p className='mt-1 text-xs text-red-400'>{errors.contactPerson}</p>
                )}
              </div>
            </div>

            {/* Email & Phone */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-white mb-1.5'>
                  Business Email <span className='text-red-400'>*</span>
                </label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  maxLength={26}
                  className='w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 px-4 py-3 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all'
                  placeholder='name@company.com'
                />
                {errors.email && (
                  <p className='mt-1 text-xs text-red-400'>{errors.email}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-white mb-1.5'>
                  Phone Number (optional)
                </label>
                <input
                  type='tel'
                  name='phone'
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={12}
                  className='w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 px-4 py-3 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all'
                  placeholder='+92 300 1234567'
                />
                {errors.phone && (
                  <p className='mt-1 text-xs text-red-400'>{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className='block text-sm font-medium text-white mb-1.5'>
                Business Address (optional)
              </label>
              <textarea
                name='address'
                value={formData.address}
                onChange={handleChange}
                maxLength={200}
                rows={3}
                className='w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 px-4 py-3 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all resize-y'
                placeholder='Street, City, Postal Code, Country'
              />
            </div>

            {/* Account Type */}
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Account Type <span className='text-red-400'>*</span>
              </label>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                {accountTypes.map((type) => (
                  <label
                    key={type}
                    className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer text-sm font-medium transition-all duration-200 ${
                      formData.accountType === type
                        ? "bg-cyan-500/20 border-cyan-400 text-white shadow-sm"
                        : "bg-white/5 border-white/20 text-blue-200 hover:bg-white/10 hover:border-white/40"
                    }`}
                  >
                    <input
                      type='radio'
                      name='accountType'
                      value={type}
                      checked={formData.accountType === type}
                      onChange={handleChange}
                      className='sr-only'
                    />
                    {type}
                  </label>
                ))}
              </div>
              {errors.accountType && (
                <p className='mt-2 text-xs text-red-400'>{errors.accountType}</p>
              )}
            </div>

            {/* Estimated Shipments */}
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Estimated Monthly Shipments <span className='text-red-400'>*</span>
              </label>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                {shipmentRanges.map((range) => (
                  <label
                    key={range}
                    className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer text-sm font-medium transition-all duration-200 ${
                      formData.estimatedMonthlyShipments === range
                        ? "bg-cyan-500/20 border-cyan-400 text-white shadow-sm"
                        : "bg-white/5 border-white/20 text-blue-200 hover:bg-white/10 hover:border-white/40"
                    }`}
                  >
                    <input
                      type='radio'
                      name='estimatedMonthlyShipments'
                      value={range}
                      checked={formData.estimatedMonthlyShipments === range}
                      onChange={handleChange}
                      className='sr-only'
                    />
                    {range}
                  </label>
                ))}
              </div>
              {errors.estimatedMonthlyShipments && (
                <p className='mt-2 text-xs text-red-400'>
                  {errors.estimatedMonthlyShipments}
                </p>
              )}
            </div>

            {/* Interested Features */}
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                Interested in (select all that apply){" "}
                <span className='text-red-400'>*</span>
              </label>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {featuresList.map((feature) => (
                  <label
                    key={feature}
                    className='flex items-center gap-2.5 cursor-pointer group py-1.5'
                  >
                    <input
                      type='checkbox'
                      value={feature}
                      checked={formData.interestedFeatures.includes(feature)}
                      onChange={handleChange}
                      className='h-5 w-5 rounded border-white/30 text-cyan-500 focus:ring-cyan-500/30 bg-white/10'
                    />
                    <span className='text-sm text-blue-100 group-hover:text-white transition-colors'>
                      {feature}
                    </span>
                  </label>
                ))}
              </div>
              {errors.interestedFeatures && (
                <p className='mt-2 text-xs text-red-400'>
                  {errors.interestedFeatures}
                </p>
              )}
            </div>

            {/* Comments */}
            <div>
              <label className='block text-sm font-medium text-white mb-1.5'>
                Additional Comments / Questions (optional)
              </label>
              <textarea
                name='comments'
                value={formData.comments}
                onChange={handleChange}
                maxLength={500}
                rows={5}
                className='w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 px-4 py-3 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all resize-y'
                placeholder='Tell us more about your needs, current challenges, volume, integrations you want...'
              />
              <p className='text-xs text-blue-300 mt-1 text-right'>
                {formData.comments.length} / 500
              </p>
            </div>

            {/* Submit */}
            <div className='pt-6'>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2.5 text-lg disabled:opacity-60 disabled:cursor-not-allowed'
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='h-6 w-6 animate-spin' />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className='h-6 w-6' />
                    Submit Registration
                  </>
                )}
              </Button>
            </div>

            <p className='text-center text-sm text-blue-300 mt-5 flex items-center justify-center gap-2'>
              <Shield className='h-5 w-5' />
              Your information is secure with us — we never share it
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Form;
