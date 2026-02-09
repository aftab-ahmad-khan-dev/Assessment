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

/* ────────────────────────────────────────────────
* I used Sub-components (all inside the same file for better readability) for better organization and to apply staggered animations easily. You can move them to separate files if you prefer.
 ────────────────────────────────────────────────*/

const CompanyAndContactSection = ({ formData, errors, handleChange }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.1 }}
    className='space-y-6'
  >
    <div>
      <label className='block text-sm font-medium text-white mb-2'>
        Company Name <span className='text-red-400'>*</span>
      </label>
      <input
        type='text'
        name='companyName'
        value={formData.companyName}
        onChange={handleChange}
        className='w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 px-4 py-3 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all'
        placeholder='Acme Logistics Inc.'
      />
      {errors.companyName && (
        <p className='mt-2 text-xs text-red-400'>{errors.companyName}</p>
      )}
    </div>

    <div>
      <label className='block text-sm font-medium text-white mb-2'>
        Contact Person <span className='text-red-400'>*</span>
      </label>
      <input
        type='text'
        name='contactPerson'
        value={formData.contactPerson}
        onChange={handleChange}
        className='w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 px-4 py-3 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all'
        placeholder='Jane Smith'
      />
      {errors.contactPerson && (
        <p className='mt-2 text-xs text-red-400'>{errors.contactPerson}</p>
      )}
    </div>
  </motion.div>
);

const EmailPhoneSection = ({ formData, errors, handleChange }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.15 }}
    className='grid grid-cols-1 md:grid-cols-2 gap-6'
  >
    <div>
      <label className='block text-sm font-medium text-white mb-2'>
        Business Email <span className='text-red-400'>*</span>
      </label>
      <input
        type='email'
        name='email'
        value={formData.email}
        onChange={handleChange}
        className='w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 px-4 py-3 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all'
        placeholder='contact@acmelogistics.com'
      />
      {errors.email && <p className='mt-2 text-xs text-red-400'>{errors.email}</p>}
    </div>

    <div>
      <label className='block text-sm font-medium text-white mb-2'>
        Phone Number (optional)
      </label>
      <input
        type='tel'
        name='phone'
        value={formData.phone}
        onChange={handleChange}
        className='w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 px-4 py-3 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all'
        placeholder='+1 (555) 123-4567'
      />
      {errors.phone && <p className='mt-2 text-xs text-red-400'>{errors.phone}</p>}
    </div>
  </motion.div>
);

const AddressSection = ({ formData, errors, handleChange }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.2 }}
  >
    <label className='block text-sm font-medium text-white mb-2'>
      Business Address (optional)
    </label>
    <textarea
      name='address'
      value={formData.address}
      onChange={handleChange}
      rows={3}
      className='w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 px-4 py-3 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all resize-y'
      placeholder='123 Shipping Lane, Suite 400, Miami, FL 33101'
    />
    {errors.address && <p className='mt-2 text-xs text-red-400'>{errors.address}</p>}
  </motion.div>
);

const RadioGroup = ({ label, name, options, value, onChange, error }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.25 }}
  >
    <label className='block text-sm font-medium text-white mb-2'>
      {label} <span className='text-red-400'>*</span>
    </label>
    <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
      {options.map((option) => (
        <label
          key={option}
          className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer text-sm font-medium transition-all duration-200 ${
            value === option
              ? "bg-cyan-500/20 border-cyan-400 text-white shadow-sm"
              : "bg-white/5 border-white/20 text-blue-200 hover:bg-white/10 hover:border-white/40"
          }`}
        >
          <input
            type='radio'
            name={name}
            value={option}
            checked={value === option}
            onChange={onChange}
            className='sr-only'
          />
          {option}
        </label>
      ))}
    </div>
    {error && <p className='mt-2 text-xs text-red-400'>{error}</p>}
  </motion.div>
);

const FeaturesSection = ({ formData, errors, handleChange }) => {
  const featuresList = [
    "Smart OCR Sticker Scanning",
    "Real-time Analytics Dashboard",
    "Automated Data Extraction",
    "Multi-user Team Access",
    "API Integration",
    "Custom Reporting",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <label className='block text-sm font-medium text-white mb-2'>
        Interested in (select all that apply) <span className='text-red-400'>*</span>
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
        <p className='mt-2 text-xs text-red-400'>{errors.interestedFeatures}</p>
      )}
    </motion.div>
  );
};

const CommentsSection = ({ formData, handleChange }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.35 }}
  >
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
  </motion.div>
);

/* ────────────────────────────────────────────────
 * Main Form Component
 ────────────────────────────────────────────────*/

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
  const [showSuccess, setShowSuccess] = useState(false); // NEW: for thank you card

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

    const rule = formValidationRules[name];
    const normalizedValue = rule?.normalize ? rule.normalize(value) : value;

    setFormData((prev) => ({ ...prev, [name]: normalizedValue }));

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

        setShowSuccess(true);

        // Auto-hide and reset form after animation
        setTimeout(() => {
          setShowSuccess(false);
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
        }, 2200); // 2.2 seconds — enough for full spin + a moment to read
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

  return (
    <div className='min-h-screen -mt-10 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden'>
      {/* Success overlay with rotating card */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50'
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
            animate={{
              scale: 1,
              opacity: 1,
              rotate: 360, // full 360° rotation
            }}
            transition={{
              duration: 1.4,
              ease: "easeOut",
              type: "spring",
              stiffness: 90,
              damping: 12,
            }}
            className='bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 md:p-14 shadow-2xl shadow-cyan-500/30 text-center max-w-md mx-6 relative overflow-hidden'
          >
            {/* Optional subtle background glow */}
            <div className='absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 -z-10' />

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
            >
              <CheckCircle className='h-24 w-24 mx-auto text-cyan-400 mb-8 drop-shadow-lg' />
            </motion.div>

            <h2 className='text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight'>
              Thank You!
            </h2>

            <p className='text-blue-200 text-lg md:text-xl mb-8'>
              Your registration has been successfully submitted.
              <br />
              We'll reach out within 24 hours.
            </p>

            {/* Optional manual close if you prefer */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSuccess(false)}
              className='mt-4 px-6 py-3 bg-cyan-600/80 hover:bg-cyan-600 text-white rounded-xl font-medium transition-colors'
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* Main form content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className='max-w-3xl mx-auto'
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-8 md:p-10'
        >
          <h1 className='text-3xl md:text-4xl font-bold text-white text-center mb-2'>
            Business Registration
          </h1>
          <p className='text-blue-300 text-center mb-10'>
            Tell us about your business. We'll get back to you within 24 hours.
          </p>

          <form onSubmit={handleSubmit} className='space-y-8'>
            <CompanyAndContactSection
              formData={formData}
              errors={errors}
              handleChange={handleChange}
            />

            <EmailPhoneSection
              formData={formData}
              errors={errors}
              handleChange={handleChange}
            />

            <AddressSection
              formData={formData}
              errors={errors}
              handleChange={handleChange}
            />

            <RadioGroup
              label='Account Type'
              name='accountType'
              options={accountTypes}
              value={formData.accountType}
              onChange={handleChange}
              error={errors.accountType}
            />

            <RadioGroup
              label='Estimated Monthly Shipments'
              name='estimatedMonthlyShipments'
              options={shipmentRanges}
              value={formData.estimatedMonthlyShipments}
              onChange={handleChange}
              error={errors.estimatedMonthlyShipments}
            />

            <FeaturesSection
              formData={formData}
              errors={errors}
              handleChange={handleChange}
            />

            <CommentsSection formData={formData} handleChange={handleChange} />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className='pt-6'
            >
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
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className='text-center text-sm text-blue-300 mt-5 flex items-center justify-center gap-2'
            >
              <Shield className='h-5 w-5' />
              Your information is secure with us — we never share it
            </motion.p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Form;
