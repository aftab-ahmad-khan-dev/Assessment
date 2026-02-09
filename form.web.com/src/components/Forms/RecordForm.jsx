import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  X as CloseIcon,
  Plus,
  AlertTriangle,
  Package,
  Trash2,
  Printer,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../UI/Button.jsx";
import Input from "../UI/Input.jsx";
import Modal from "../UI/Modal.jsx";
import { useApi } from "../../context/ApiContext.jsx";

const RecordForm = ({
  initialData: propInitialData,
  imageFiles: propImageFiles,
  onSaved = () => {},
  onCancel = () => {},
}) => {
  const { createRecord } = useApi();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract initialData and imageFiles from location.state or props with proper defaults
  const { initialData: stateInitialData, imageFiles: stateImageFiles } =
    location.state || {};
  const initialData = stateInitialData || propInitialData || {};
  const imageFiles = stateImageFiles || propImageFiles || [];

  const [isLoadingInitialData, setIsLoadingInitialData] = useState(false);
  const [formData, setFormData] = useState({
    shippingDate: "",
    totalWeight: "",
    totalPieces: "",
    quantity: "",
    price: "",
    contents: "",
    additionalInfo: "",
    invoiceType: "business-invoice",
  });
  const [formConfidence, setFormConfidence] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [contentItems, setContentItems] = useState([]);
  const [commulativeImgUrls, setCommulativeImgUrls] = useState(
    initialData.commulativeImgUrls || []
  );
  const [barcodeNumbers, setBarcodeNumbers] = useState(
    initialData.barcodeNumbers || []
  );
  const [internalNumbers, setInternalNumbers] = useState(
    initialData.internalNumbers || []
  );

  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setDataFromExtraction(initialData);
    }
    setIsLoadingInitialData(false);
  }, [initialData]);

  useEffect(() => {
    updateTotals();
  }, [contentItems]);

  const setDataFromExtraction = (data) => {
    if (data.price && data.price.endsWith(" KWD")) {
      data.price = data.price.replace(" KWD", "");
    }
    if (data.totalWeight && data.totalWeight.endsWith(" kg")) {
      data.totalWeight = data.totalWeight.replace(" kg", "");
    }

    const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([key, value]) => value !== "UNKNOWN" && value !== undefined
      )
    );

    const applicableData = Object.fromEntries(
      Object.entries(filteredData).filter(([key]) =>
        [
          "shippingDate",
          "totalWeight",
          "totalPieces",
          "quantity",
          "price",
          "contents",
          "additionalInfo",
        ].includes(key)
      )
    );

    setFormData((prev) => ({
      ...prev,
      ...applicableData,
      invoiceType: "business-invoice",
    }));
    setFormConfidence(data.confidenceScores || {});
    setCommulativeImgUrls(data.commulativeImgUrls || []);
    setBarcodeNumbers(data.barcodes || []);
    setInternalNumbers(data.internalNumbers || []);
    if (data.contentItems && data.contentItems.length > 0) {
      setContentItems(data.contentItems);
    } else if (data.contents && data.contents !== "UNKNOWN") {
      const items = data.contents.split(",").map((item) => {
        const [name, qty] = item.split("*");
        return { name: name.trim(), qty: qty?.trim() || "1", price: "0.01" };
      });
      setContentItems(items);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleContentChange = (index, field, value) => {
    const newItems = [...contentItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setContentItems(newItems);
    setFormData((prev) => ({
      ...prev,
      contents: newItems.map((item) => `${item.name}*${item.qty}`).join(", "),
    }));
  };

  const handleAddContent = () => {
    setContentItems([...contentItems, { name: "", qty: "1", price: "0.01" }]);
  };

  const handleRemoveContent = (index) => {
    const newItems = contentItems.filter((_, i) => i !== index);
    setContentItems(newItems);
    setFormData((prev) => ({
      ...prev,
      contents: newItems.map((item) => `${item.name}*${item.qty}`).join(", "),
    }));
  };

  const updateTotals = () => {
    const totalPiecesSum = contentItems.reduce(
      (sum, item) => sum + (parseInt(item.qty, 10) || 0),
      0
    );
    const totalQuantity = contentItems.length;
    const totalPrice = contentItems
      .reduce((sum, item) => {
        const qty = parseInt(item.qty, 10) || 0;
        const price = parseFloat(item.price) || 0;
        return sum + qty * price;
      }, 0)
      .toFixed(2);
    setFormData((prev) => ({
      ...prev,
      quantity: totalQuantity.toString(),
      totalPieces: totalPiecesSum.toString(),
      price: totalPrice,
    }));
  };

  const handleSave = async () => {
    if (contentItems.length === 0) {
      setValidationErrors({ contents: "At least one content item is required" });
      toast.error("Please add at least one content item");
      return;
    }
    for (let i = 0; i < contentItems.length; i++) {
      const item = contentItems[i];
      if (!item.name.trim()) {
        setValidationErrors({ contents: `Content item ${i + 1} name is required` });
        toast.error(`Content item ${i + 1} name is required`);
        return;
      }
      if (!item.qty || parseInt(item.qty) < 1) {
        setValidationErrors({
          contents: `Content item ${i + 1} quantity must be at least 1`,
        });
        toast.error(`Content item ${i + 1} quantity must be at least 1`);
        return;
      }
      if (!item.price || parseFloat(item.price) < 0.01) {
        setValidationErrors({
          contents: `Content item ${i + 1} price must be at least 0.01 KWD`,
        });
        toast.error(`Content item ${i + 1} price must be at least 0.01 KWD`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const imageUrls =
        commulativeImgUrls.length > 0
          ? [...commulativeImgUrls]
          : [
              "https://images.pexels.com/photos/4481327/pexels-photo-4481327.jpeg?auto=compress&cs=tinysrgb&w=800",
            ];

      const clientId = `client-${Math.floor(Math.random() * 1000000)}`;
      const recordData = {
        clientName: clientId,
        additional: {
          shippingDate: formData.shippingDate || "UNKNOWN",
          totalWeight: parseFloat(formData.totalWeight) || undefined,
          totalPieces: parseInt(formData.totalPieces) || undefined,
          price: parseFloat(formData.price) || undefined,
        },
        contents: contentItems.map((item) => ({
          name: item.name.trim(),
          qty: parseInt(item.qty) || 1,
          price: parseFloat(item.price) || 0.01,
        })),
        additionalInfo: formData.additionalInfo,
        commulativeImgUrls: imageUrls,
        tracking: {
          barcodeNumbers: [...barcodeNumbers].filter(Boolean),
          internalNumbers: [...internalNumbers].filter(Boolean),
          distributionCode: "", // Add default or derived value if needed
        },
        invoiceType: formData.invoiceType,
        confidenceScores: formConfidence,
      };

      console.log("Saving record with data:", recordData);
      await createRecord(recordData);
      toast.success("Record saved successfully!");
      navigate("/records");
      onSaved();
      setValidationErrors({});
    } catch (error) {
      console.error("Error saving record:", error);
      toast.error(`Failed to save record: ${error.message || "Unknown error"}`);
      setValidationErrors({ general: error.message || "Unknown error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    const logoUrl = "/logo.png"; // Absolute path for logo in public
    const img = new Image();
    img.src = logoUrl;
    img.crossOrigin = "anonymous";

    img.onload = () => {
      window.print();
    };

    img.onerror = (error) => {
      console.error("Failed to load logo for printing:", {
        url: logoUrl,
        error: error.message || "Unknown error",
        status: error.target?.status,
        statusText: error.target?.statusText,
      });
      toast.error("Failed to load logo for printing. Using placeholder.");
      window.print();
    };
  };

  const handleBack = () => {
    navigate("/scan");
  };

  const handleAddBarcode = () => {
    setBarcodeNumbers([...barcodeNumbers, ""]);
  };

  const handleBarcodeChange = (index, value) => {
    const newBarcodeNumbers = [...barcodeNumbers];
    newBarcodeNumbers[index] = value;
    setBarcodeNumbers(newBarcodeNumbers);
  };

  const handleRemoveBarcode = (index) => {
    const newBarcodeNumbers = barcodeNumbers.filter((_, i) => i !== index);
    setBarcodeNumbers(newBarcodeNumbers);
  };

  const handleAddInternalNumber = () => {
    setInternalNumbers([...internalNumbers, ""]);
  };

  const handleInternalNumberChange = (index, value) => {
    const newInternalNumbers = [...internalNumbers];
    newInternalNumbers[index] = value;
    setInternalNumbers(newInternalNumbers);
  };

  const handleRemoveInternalNumber = (index) => {
    const newInternalNumbers = internalNumbers.filter((_, i) => i !== index);
    setInternalNumbers(newInternalNumbers);
  };

  const fieldGroups = [
    {
      title: "Tracking Information",
      icon: Printer,
      color: "blue",
      fields: [
        { key: "barcodeNumbers", label: "Barcodes", type: "badge" },
        { key: "internalNumbers", label: "Internal Numbers", type: "badge" },
      ],
    },
    {
      title: "Package Details",
      icon: Package,
      color: "orange",
      fields: [
        { key: "shippingDate", label: "Shipping Date", type: "date" },
        { key: "totalWeight", label: "Total Weight (kg)", type: "text" },
        { key: "totalPieces", label: "Total Pieces (Pcs)", type: "display" },
        { key: "quantity", label: "Quantity (Qty)", type: "display" },
        { key: "price", label: "Total Price (KWD)", type: "display" },
        { key: "contents", label: "Contents", type: "custom" },
        { key: "additionalInfo", label: "Additional Information", type: "textarea" },
      ],
    },
  ];

  const isLowConfidence = (field) => {
    return formConfidence?.[field] < 0.7;
  };

  const getColorClasses = (color) => {
    const colors = {
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-900",
        icon: "text-purple-600",
        accent: "bg-purple-100",
      },
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-900",
        icon: "text-blue-600",
        accent: "bg-blue-100",
      },
      green: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-900",
        icon: "text-emerald-600",
        accent: "bg-emerald-100",
      },
      orange: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-900",
        icon: "text-orange-600",
        accent: "bg-orange-100",
      },
    };
    return colors[color] || colors.blue;
  };

  const renderDisplayField = (field) => {
    const isNumeric = ["quantity", "totalPieces"].includes(field.key);
    const defaultVal = isNumeric ? "0" : "0.00";
    const value = formData[field.key] || defaultVal;
    const displayValue = field.key === "price" ? `${value} KWD` : value;
    return (
      <div className='lg:col-span-1'>
        <label className='block text-sm font-semibold text-gray-700 mb-3'>
          {field.label}
        </label>
        <div
          className={`px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 font-medium pointer-events-none ${
            isLowConfidence(field.key) ? "bg-yellow-50 border-yellow-300" : ""
          }`}
        >
          {displayValue}
        </div>
        {isLowConfidence(field.key) && (
          <div className='flex items-center mt-2 text-sm font-medium text-yellow-700 bg-yellow-100 px-3 py-2 rounded-lg'>
            <AlertTriangle className='h-4 w-4 mr-2' />
            Low confidence - please verify
          </div>
        )}
      </div>
    );
  };

  const renderBadgeField = (field) => {
    const values = field.key === "barcodeNumbers" ? barcodeNumbers : internalNumbers;
    const setValues =
      field.key === "barcodeNumbers" ? setBarcodeNumbers : setInternalNumbers;
    const handleAdd =
      field.key === "barcodeNumbers" ? handleAddBarcode : handleAddInternalNumber;
    const handleChange =
      field.key === "barcodeNumbers"
        ? handleBarcodeChange
        : handleInternalNumberChange;
    const handleRemove =
      field.key === "barcodeNumbers"
        ? handleRemoveBarcode
        : handleRemoveInternalNumber;

    return (
      <div className='lg:col-span-1'>
        <label className='block text-sm font-semibold text-gray-700 mb-3'>
          {field.label}
        </label>
        <div className='flex flex-wrap gap-2 mb-2'>
          {values.map((value, index) => (
            <div
              key={index}
              className='flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full'
            >
              <input
                type='text'
                value={value || ""}
                onChange={(e) => handleChange(index, e.target.value)}
                className='bg-transparent border-none focus:outline-none w-20'
              />
              <button
                type='button'
                onClick={() => handleRemove(index)}
                className='ml-1 text-blue-600 hover:text-blue-800'
              >
                ×
              </button>
            </div>
          ))}
          <button
            type='button'
            onClick={handleAdd}
            className='flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-0.5 border border-blue-300 rounded-full hover:bg-blue-50'
          >
            <Plus className='h-4 w-4 mr-1' /> Add
          </button>
        </div>
        {isLowConfidence(field.key) && (
          <div className='flex items-center mt-2 text-sm font-medium text-yellow-700 bg-yellow-100 px-3 py-2 rounded-lg'>
            <AlertTriangle className='h-4 w-4 mr-2' />
            Low confidence - please verify
          </div>
        )}
      </div>
    );
  };

  if (isLoadingInitialData) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='text-center'
        >
          <Loader2 className='h-12 w-12 text-blue-600 animate-spin mx-auto' />
          <p className='mt-4 text-lg text-gray-600'>Loading form data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className='min-h-screen'>
      <div className='max-w-8xl mx-auto p-0 space-y-8'>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className='text-center py-8'
        >
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>
            Create New Record
          </h1>
          <p className='text-lg text-gray-600'>
            Fill in the details to create a new shipping record
          </p>
        </motion.div>

        {fieldGroups.map((group, groupIndex) => {
          const colorClasses = getColorClasses(group.color);
          return (
            <motion.div
              key={group.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + groupIndex * 0.1 }}
              className={`${colorClasses.bg} ${colorClasses.border} rounded-2xl border-2 p-8 shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className='flex items-center mb-8'>
                <div
                  className={`${colorClasses.accent} rounded-full p-3 mr-4 shadow-sm`}
                >
                  <group.icon className={`h-6 w-6 ${colorClasses.icon}`} />
                </div>
                <h3 className={`text-2xl font-bold ${colorClasses.text}`}>
                  {group.title}
                </h3>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {group.fields.map((field) => (
                  <div
                    key={field.key}
                    className={
                      field.type === "textarea" || field.type === "custom"
                        ? "lg:col-span-2"
                        : ""
                    }
                  >
                    {field.type === "display" ? (
                      renderDisplayField(field)
                    ) : field.type === "badge" ? (
                      renderBadgeField(field)
                    ) : field.type === "textarea" ? (
                      <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-3'>
                          {field.label}
                          {field.required && (
                            <span className='text-red-500 ml-1'>*</span>
                          )}
                        </label>
                        <textarea
                          value={formData[field.key] || ""}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          rows={4}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none resize-y transition-all duration-200 shadow-sm ${
                            isLowConfidence(field.key)
                              ? "bg-yellow-50 border-yellow-300 shadow-yellow-100"
                              : validationErrors[field.key]
                              ? "border-red-300 bg-red-50 shadow-red-100"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        />
                        {isLowConfidence(field.key) && (
                          <div className='flex items-center mt-2 text-sm font-medium text-yellow-700 bg-yellow-100 px-3 py-2 rounded-lg'>
                            <AlertTriangle className='h-4 w-4 mr-2' />
                            Low confidence - please verify
                          </div>
                        )}
                        {validationErrors[field.key] && (
                          <div className='mt-2 text-sm font-medium text-red-600 bg-red-100 px-3 py-2 rounded-lg'>
                            {validationErrors[field.key]}
                          </div>
                        )}
                      </div>
                    ) : field.type === "custom" && field.key === "contents" ? (
                      <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-3'>
                          {field.label}
                        </label>
                        <div className='space-y-4'>
                          {contentItems.map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className='grid grid-cols-1 md:grid-cols-3 gap-3'
                            >
                              <div className='flex items-center space-x-2 bg-white/60 backdrop-blur rounded-xl p-3 border border-gray-200 hover:border-gray-300 transition-all duration-200'>
                                <input
                                  type='text'
                                  value={item.name || ""}
                                  onChange={(e) =>
                                    handleContentChange(
                                      index,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  placeholder={`Item ${index + 1}`}
                                  className={`flex-1 px-2 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200 text-sm ${
                                    !item.name && validationErrors.contents
                                      ? "border-red-300 bg-red-50"
                                      : ""
                                  }`}
                                />
                              </div>
                              <div className='flex items-center space-x-2 bg-white/60 backdrop-blur rounded-xl p-3 border border-gray-200 hover:border-gray-300 transition-all duration-200'>
                                <input
                                  type='number'
                                  value={item.qty || ""}
                                  onChange={(e) =>
                                    handleContentChange(index, "qty", e.target.value)
                                  }
                                  placeholder='Qty'
                                  className={`flex-1 px-2 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200 text-sm ${
                                    (!item.qty || parseInt(item.qty) < 1) &&
                                    validationErrors.contents
                                      ? "border-red-300 bg-red-50"
                                      : ""
                                  }`}
                                  min='1'
                                />
                              </div>
                              <div className='flex items-center space-x-2 bg-white/60 backdrop-blur rounded-xl p-3 border border-gray-200 hover:border-gray-300 transition-all duration-200'>
                                <input
                                  type='number'
                                  step='0.01'
                                  value={item.price || ""}
                                  onChange={(e) =>
                                    handleContentChange(
                                      index,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  placeholder='Price (KWD)'
                                  className={`flex-1 px-2 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200 text-sm ${
                                    (!item.price || parseFloat(item.price) < 0.01) &&
                                    validationErrors.contents
                                      ? "border-red-300 bg-red-50"
                                      : ""
                                  }`}
                                  min='0.01'
                                />
                                <button
                                  type='button'
                                  onClick={() => handleRemoveContent(index)}
                                  className='p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 flex-shrink-0'
                                >
                                  <Trash2 className='h-4 w-4' />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                          <motion.button
                            type='button'
                            onClick={handleAddContent}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className='flex items-center justify-center w-1/3 py-3 px-4 border-2 border-solid border-gray-300 rounded-xl text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 font-medium'
                          >
                            <Plus className='h-5 w-5 mr-2' />
                            Add Another Item
                          </motion.button>
                        </div>
                        {isLowConfidence(field.key) && (
                          <div className='flex items-center mt-2 text-sm font-medium text-yellow-700 bg-yellow-100 px-3 py-2 rounded-lg'>
                            <AlertTriangle className='h-4 w-4 mr-2' />
                            Low confidence - please verify
                          </div>
                        )}
                        {validationErrors[field.key] && (
                          <div className='mt-2 text-sm font-medium text-red-600 bg-red-100 px-3 py-2 rounded-lg'>
                            {validationErrors[field.key]}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Input
                        label={field.label}
                        type={field.type}
                        value={formData[field.key] || ""}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        required={field.required}
                        className={`transition-all duration-200 ${
                          isLowConfidence(field.key)
                            ? "bg-yellow-50 border-yellow-300 shadow-yellow-100"
                            : "bg-white border-gray-200 hover:border-gray-300 focus:ring-4 focus:ring-blue-500/20"
                        }`}
                        error={validationErrors[field.key]}
                        warning={
                          isLowConfidence(field.key)
                            ? "Low confidence - please verify"
                            : null
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className='flex justify-center space-x-6 py-8'
        >
          <Button
            variant='outline'
            onClick={handleBack}
            className='px-8 py-3 text-lg font-semibold border-2 hover:bg-gray-50 shadow-lg'
          >
            <CloseIcon className='h-5 w-5 mr-2' />
            Back
          </Button>
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            className='px-8 py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg'
          >
            <Save className='h-5 w-5 mr-2' />
            Save Record
          </Button>
          <Button
            onClick={handlePrint}
            className='px-8 py-3 text-lg font-semibold bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg'
          >
            <Printer className='h-5 w-5 mr-2' />
            Print Products
          </Button>
        </motion.div>

        {/* Print Template */}
        <div style={{ display: "none" }} className='print-only'>
          <div className='print-container'>
            <div className='print-header'>
              <img
                src='/assets/logo.png'
                alt='Company Logo'
                onError={(e) => {
                  console.error("Logo failed to load in DOM:", {
                    url: "/assets/logo.png",
                    error: e.message || "Unknown error",
                  });
                  e.target.src = "/assets/placeholder-image.jpg";
                }}
              />
              <div className='header-text'>
                <h1>Record ID: {initialData.clientName || "New Record"}</h1>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Tracking Information */}
            <div className='print-section'>
              <h2>Tracking Information</h2>
              <div className='print-field'>
                <label>Barcodes:</label>
                <span>
                  {barcodeNumbers.length > 0
                    ? barcodeNumbers.join(", ")
                    : "Not specified"}
                </span>
              </div>
              <div className='print-field'>
                <label>Tracking Numbers:</label>
                <span>
                  {internalNumbers.length > 0
                    ? internalNumbers.join(", ")
                    : "Not specified"}
                </span>
              </div>
            </div>

            {/* Package Details */}
            <div className='print-section'>
              <h2>Package Details</h2>
              <div className='print-field'>
                <label>Shipping Date:</label>
                <span>
                  {formData.shippingDate
                    ? new Date(formData.shippingDate).toLocaleDateString()
                    : "Not specified"}
                </span>
              </div>
              <div className='print-field'>
                <label>Total Weight (kg):</label>
                <span>{formData.totalWeight || "Not specified"}</span>
              </div>
              <div className='print-field'>
                <label>Total Pieces:</label>
                <span>{formData.totalPieces || "0"}</span>
              </div>
              <div className='print-field'>
                <label>Quantity:</label>
                <span>{formData.quantity || "0"}</span>
              </div>
              <div className='print-field'>
                <label>Total Price (KWD):</label>
                <span>{parseFloat(formData.price || "0").toFixed(2)}</span>
              </div>
              <div className='print-field'>
                <label>Additional Information:</label>
                <span>{formData.additionalInfo || "Not specified"}</span>
              </div>
            </div>

            {/* Contents */}
            <div className='print-section'>
              <h2>Contents</h2>
              {contentItems.length > 0 ? (
                <>
                  <table className='print-table'>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Price (KWD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contentItems.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.qty}</td>
                          <td>{parseFloat(item.price || "0").toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className='print-totals'>
                    <p>
                      Total Quantity:{" "}
                      {contentItems.reduce(
                        (sum, item) => sum + (parseInt(item.qty) || 0),
                        0
                      )}
                    </p>
                    <p>
                      Total Price:{" "}
                      {contentItems
                        .reduce(
                          (sum, item) =>
                            sum +
                            (parseFloat(item.price) || 0) *
                              (parseInt(item.qty) || 1),
                          0
                        )
                        .toFixed(2)}{" "}
                      KWD
                    </p>
                  </div>
                </>
              ) : (
                <div className='print-field'>
                  <label>Contents:</label>
                  <span>No contents specified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media screen {
            .print-only {
              display: none !important;
            }
          }
          @media print {
            body * {
              visibility: hidden;
            }
            .print-only, .print-only * {
              visibility: visible;
            }
            .print-only {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              font-family: Arial, Helvetica, sans-serif;
              color: #000;
              display: block !important;
            }
            .print-container {
              max-width: 800px;
              margin: 20px auto;
              padding: 20px;
              border: 1px solid #000;
            }
            .print-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .print-header img {
              max-width: 150px;
              height: auto;
            }
            .print-header .header-text {
              text-align: right;
            }
            .print-header h1 {
              font-size: 24px;
              margin: 0;
            }
            .print-header p {
              font-size: 14px;
              color: #333;
              margin: 5px 0 0;
            }
            .print-section {
              margin-bottom: 20px;
            }
            .print-section h2 {
              font-size: 18px;
              margin-bottom: 10px;
              border-bottom: 1px solid #000;
            }
            .print-field {
              margin-bottom: 8px;
              font-size: 14px;
            }
            .print-field label {
              font-weight: bold;
              display: inline-block;
              width: 200px;
              vertical-align: top;
            }
            .print-field span {
              display: inline-block;
              max-width: 500px;
            }
            .print-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            .print-table th, .print-table td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            .print-table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .print-totals {
              margin-top: 10px;
              font-size: 14px;
              font-weight: bold;
            }
            @page {
              margin: 1cm;
            }
        `}
      </style>
    </div>
  );
};

export default RecordForm;
