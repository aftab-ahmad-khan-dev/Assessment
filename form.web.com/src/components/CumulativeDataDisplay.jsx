import React from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Package, ChevronLeft } from "lucide-react";
import Button from "../UI/Button.jsx";

const CumulativeDataDisplay = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const cumulativeData = state?.cumulativeData || {};

  const { contentItems = [], imageUrls = [], ...formData } = cumulativeData;

  const handleBack = () => {
    navigate("/record-form", {
      state: { initialData: cumulativeData, imageFiles: [] },
    });
  };

  return (
    <div className='min-h-screen p-8'>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className='text-center py-8'
      >
        <h1 className='text-4xl font-bold text-gray-900 mb-2'>
          Cumulative Data Summary
        </h1>
        <p className='text-lg text-gray-600'>
          Review the aggregated data from all processed images
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className='bg-orange-50 border-orange-200 rounded-2xl border-2 p-8 shadow-lg hover:shadow-xl transition-all duration-300'
      >
        <div className='flex items-center mb-8'>
          <div className='bg-orange-100 rounded-full p-3 mr-4 shadow-sm'>
            <Package className='h-6 w-6 text-orange-600' />
          </div>
          <h3 className='text-2xl font-bold text-orange-900'>Package Summary</h3>
        </div>

        <div className='space-y-6'>
          <div>
            <h4 className='text-lg font-semibold text-gray-700'>Aggregated Items</h4>
            {contentItems.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
                {contentItems.map((item, index) => (
                  <div
                    key={index}
                    className='bg-white/60 backdrop-blur rounded-xl p-4 border border-gray-200'
                  >
                    <p className='text-sm font-medium text-gray-900'>
                      Item {index + 1}: {item.name}
                    </p>
                    <p className='text-sm text-gray-600'>Quantity: {item.qty}</p>
                    <p className='text-sm text-gray-600'>
                      Price per unit: {parseFloat(item.price).toFixed(2)} KWD
                    </p>
                    <p className='text-sm text-gray-600'>
                      Total:{" "}
                      {(parseFloat(item.price) * parseInt(item.qty)).toFixed(2)} KWD
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-600'>No items to display.</p>
            )}
          </div>

          <div>
            <h4 className='text-lg font-semibold text-gray-700'>Totals</h4>
            <p className='text-sm text-gray-600'>
              Total Quantity: {formData.quantity || 0}
            </p>
            <p className='text-sm text-gray-600'>
              Total Pieces: {formData.totalPieces || 0}
            </p>
            <p className='text-sm text-gray-600'>
              Total Price: {parseFloat(formData.price || 0).toFixed(2)} KWD
            </p>
          </div>

          {imageUrls.length > 0 && (
            <div>
              <h4 className='text-lg font-semibold text-gray-700'>Source Images</h4>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4'>
                {imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Source image ${index + 1}`}
                    className='w-full max-h-60 object-contain rounded-lg shadow-lg'
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className='text-lg font-semibold text-gray-700'>Shipping Details</h4>
            <p className='text-sm text-gray-600'>
              Barcode Number: {formData.barcodeNumber || "N/A"}
            </p>
            <p className='text-sm text-gray-600'>
              Tracking Number: {formData.internalNumber || "N/A"}
            </p>
            <p className='text-sm text-gray-600'>
              Distribution Code: {formData.distributionCode || "N/A"}
            </p>
            <p className='text-sm text-gray-600'>
              Shipping Date: {formData.shippingDate || "N/A"}
            </p>
            <p className='text-sm text-gray-600'>
              Sender Name: {formData.senderName || "N/A"}
            </p>
            <p className='text-sm text-gray-600'>
              Sender Address: {formData.senderAddress || "N/A"}
            </p>
            <p className='text-sm text-gray-600'>
              Sender Phone: {formData.senderPhone || "N/A"}
            </p>
            <p className='text-sm text-gray-600'>
              Sender Email: {formData.senderEmail || "N/A"}
            </p>
            <p className='text-sm text-gray-600'>
              Recipient Name: {formData.recipientName || "N/A"}
            </p>
            <p className='text-sm text-gray-600'>
              Recipient Address: {formData.recipientAddress || "N/A"}
            </p>
            <p className='text-sm text-gray-600'>
              Recipient Phone: {formData.recipientPhone || "N/A"}
            </p>
            <p className='text-sm text-gray-600'>
              Total Weight: {formData.totalWeight || "N/A"} kg
            </p>
            <p className='text-sm text-gray-600'>
              Additional Info: {formData.additionalInfo || "N/A"}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className='flex justify-center py-8'
      >
        <Button
          onClick={handleBack}
          className='px-8 py-3 text-lg font-semibold bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-lg'
        >
          <ChevronLeft className='h-5 w-5 mr-2' />
          Back to Form
        </Button>
      </motion.div>
    </div>
  );
};

export default CumulativeDataDisplay;
