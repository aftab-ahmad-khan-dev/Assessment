import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Image as ImageIcon,
  CheckCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import ImageCapture from "../components/OCR/ImageCapture.jsx";
import RecordForm from "../components/Forms/RecordForm.jsx";

const NewScan = () => {
  const [currentStep, setCurrentStep] = useState("capture"); // capture, processing, form
  const [capturedImages, setCapturedImages] = useState([]);
  const [ocrResults, setOcrResults] = useState([]);
  const [progresses, setProgresses] = useState({});
  const processedFilesRef = useRef(new Set());

  const handleImageCaptured = ({ files, previews }) => {
    setCapturedImages(previews);
    setProgresses(files.reduce((acc, file) => ({ ...acc, [file.name]: 0 }), {}));
    setCurrentStep("processing");

    files.forEach((file) => {
      if (!processedFilesRef.current.has(file.name)) {
        processedFilesRef.current.add(file.name);
      }
    });
  };

  const handleOcrComplete = (results) => {
    setOcrResults((prev) => [...prev, ...results]);
    const allProcessed = capturedImages.every((img) =>
      results.some((r) => r.fileName === img.fileName)
    );
    if (allProcessed) setCurrentStep("form");
  };

  const handleOcrProgress = (fileName, progress) => {
    setProgresses((prev) => ({ ...prev, [fileName]: progress }));
  };

  const handleFormSaved = () => {
    toast.success("Records saved successfully!");
    handleStartOver();
  };

  const handleStartOver = () => {
    setCurrentStep("capture");
    setCapturedImages([]);
    setOcrResults([]);
    setProgresses({});
    processedFilesRef.current.clear();
  };

  const steps = [
    {
      key: "capture",
      title: "Capture Images",
      icon: Camera,
      description: "Take or upload photos",
      color: "blue",
    },
    {
      key: "form",
      title: "Review & Save",
      icon: ImageIcon,
      description: "Verify and save records",
      color: "green",
    },
  ];

  const getStepStatus = (key) => {
    const currentIndex = steps.findIndex((s) => s.key === currentStep);
    const stepIndex = steps.findIndex((s) => s.key === key);
    return stepIndex < currentIndex
      ? "completed"
      : stepIndex === currentIndex
        ? "active"
        : "upcoming";
  };

  const getStepColors = (stepKey, status) => {
    const step = steps.find((s) => s.key === stepKey);
    switch (status) {
      case "completed":
        return {
          bg: "bg-gradient-to-br from-green-100 to-emerald-100",
          text: "text-green-700",
          icon: "text-green-600",
          border: "border-green-200",
        };
      case "active":
        return {
          bg: `bg-gradient-to-br from-${step.color}-100 to-${step.color}-200`,
          text: `text-${step.color}-700`,
          icon: `text-${step.color}-600`,
          border: `border-${step.color}-300`,
        };
      default:
        return {
          bg: "bg-gradient-to-br from-slate-100 to-slate-200",
          text: "text-slate-500",
          icon: "text-slate-400",
          border: "border-slate-200",
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto  lg:px-10 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-center mb-8 lg:mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            AI-Powered OCR
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent mb-2">
            New Scan
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Capture multiple shipping stickers and let our AI extract all the
            important data automatically
          </p>
        </motion.div>
        {/* Steps */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="flex flex-col lg:flex-row items-center justify-center space-y-3 sm:space-y-4 lg:space-y-0 lg:space-x-8">
            {steps.map((step, index) => {
              const status = getStepStatus(step.key);
              const colors = getStepColors(step.key, status);
              const IconComponent = status === "completed" ? CheckCircle : step.icon;

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex flex-col sm:flex-row items-center space-y-1.5 sm:space-y-0 sm:space-x-3 w-full max-w-xs sm:max-w-md md:max-w-none"
                >
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute left-full top-1/2 w-8 xl:w-16 h-0.5 bg-gradient-to-r from-slate-200 to-slate-300 -translate-y-1/2 z-0"></div>
                  )}

                  <div
                    className={`relative flex flex-col sm:flex-row items-center justify-center space-y-1.5 sm:space-y-0 sm:space-x-3 p-3 sm:p-5 rounded-full border-2 ${colors.border} ${colors.bg} transition-all duration-300 w-full ${status === "active" ? "shadow-lg scale-105" : "shadow-sm"
                      }`}
                  >
                    <div
                      className={`p-2 sm:p-3 rounded-xl bg-white/80 ${status === "active" ? "animate-pulse" : ""
                        } shadow-sm`}
                    >
                      <IconComponent
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${colors.icon}`}
                      />
                    </div>

                    <div className="text-center sm:text-left">
                      <h3
                        className={`font-semibold text-xs sm:text-sm ${colors.text}`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-emerald-500/5 blur-3xl -z-10"></div>

          <div className="rounded-2xl border border-slate-200/50 bg-white shadow-lg overflow-hidden">
            {/* Capture Step */}
            {currentStep === "capture" && (
              <motion.div
                key="capture"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ImageCapture
                  onImageCaptured={handleImageCaptured}
                  onOcrComplete={handleOcrComplete}
                  onOcrProgress={handleOcrProgress}
                />
              </motion.div>
            )}

            {/* Processing Step */}
            {currentStep === "processing" && capturedImages.length > 0 && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-10 lg:p-12"
              >
                <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6 text-center">
                  Processing Your Images
                </h3>
                <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto text-center mb-8">
                  Our AI is analyzing your shipping stickers to extract data
                </p>

                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {capturedImages.map((image) => (
                    <motion.div
                      key={image.fileName}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <img
                          src={image.url}
                          alt={image.fileName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {image.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {progresses[image.fileName] === 100
                              ? "Processing Complete"
                              : "Processing..."}
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full relative"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${progresses[image.fileName] || 0}%`,
                            }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                          </motion.div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2 text-right">
                          {Math.round(progresses[image.fileName] || 0)}% complete
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Form Step */}
            {currentStep === "form" && ocrResults.length > 0 && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4 sm:p-6 bg-gradient-to-r from-green-50/50 to-emerald-50/50 border-b border-green-200/50">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-green-900">
                          Data Extracted Successfully!
                        </h3>
                        <p className="text-green-700 text-sm">
                          Review and edit the information below before saving
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleStartOver}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-200"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Start Over</span>
                    </button>
                  </div>
                </div>

                <RecordForm
                  initialData={ocrResults}
                  imageFiles={capturedImages.map((img) => img.file)}
                  onSaved={handleFormSaved}
                  onCancel={handleStartOver}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NewScan;
