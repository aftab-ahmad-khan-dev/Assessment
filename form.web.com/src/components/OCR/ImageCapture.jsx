import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Camera, X, ChevronRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { compressImage } from "../../utils/compression.js";
import ProcessingLoader from "../ProcessingLoader.jsx";
import { useApi } from "../../context/ApiContext.jsx";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_SECRET;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const ImageCapture = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [ocrResults, setOcrResults] = useState([]);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const processedFilesRef = useRef(new Set());
  const navigate = useNavigate();
  const { createRecord, uploadFile } = useApi();

  // Convert File to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  // Process image with Gemini
  const processImageWithGemini = async (imgFile, retries = 3) => {
    const confidenceThreshold = 0.9;
    const startTime = performance.now();
    try {
      console.log("Processing image with Gemini:", imgFile.name, imgFile.size);
      const base64Image = await fileToBase64(imgFile);

      const prompt = `
Extract key information from the provided shipping label image and return a valid JSON object. Return ONLY the JSON object, with no markdown, code fences (e.g., \`\`\`json), or additional text. Ensure all strings are properly escaped, especially for Arabic text or special characters. Use "UNKNOWN" for unclear or missing values. Do not include reasoning or intermediate steps. Return the following fields:

{
  "barcodeNumber": "string or UNKNOWN",
  "internalNumber": "string or UNKNOWN",
  "distributionCode": "string or UNKNOWN",
  "shippingDate": "YYYY-MM-DD or UNKNOWN",
  "senderName": "string or UNKNOWN",
  "senderAddress": "string or UNKNOWN",
  "senderPhone": "string or UNKNOWN",
  "senderEmail": "string or UNKNOWN",
  "recipientName": "string or UNKNOWN",
  "recipientAddress": "string or UNKNOWN",
  "recipientPhone": "string or UNKNOWN",
  "totalWeight": "string or UNKNOWN",
  "totalPieces": "string or UNKNOWN",
  "quantity": "string or UNKNOWN",
  "price": "numeric value without unit or UNKNOWN",
  "contents": "comma-separated list in format 'Item Name*Quantity' or UNKNOWN",
  "additionalInfo": "string or UNKNOWN",
  "confidenceScores": {
    "barcodeNumber": number,
    "internalNumber": number,
    "distributionCode": number,
    "shippingDate": number,
    "senderName": number,
    "senderAddress": number,
    "senderPhone": number,
    "senderEmail": number,
    "recipientName": number,
    "recipientAddress": number,
    "recipientPhone": number,
    "totalWeight": number,
    "totalPieces": number,
    "quantity": number,
    "price": number,
    "contents": number,
    "additionalInfo": number
  },
  "rawText": "full extracted text"
}

Special instructions:
- The senderEmail is the value immediately following the label 'Email:' (e.g., 'Email:sudheer@gmail.com' should extract 'sudheer@gmail.com'). If 'Email:' is not present or the value is unreadable, use 'UNKNOWN'.
- The senderPhone is the value immediately following the label 'Call:' (e.g., 'Call:+96522252186' should extract '+96522252186'). If 'Call:' is not present or the value is unreadable, use 'UNKNOWN' And G.W is weight.
- These fields ('Email:' and 'Call:') are typically located at the bottom of the label. Prioritize extracting them when found in this position.
- Do not include the 'Email:' or 'Call:' labels in the extracted values; only include the value that follows.
- Do not include the email or phone in additionalInfo; additionalInfo should only include order type information like 'Dropship Order, Normal, KWT ST8'.
- The shipping date is in DD-MM-YY format; convert to YYYY-MM-DD by adding 2000 to YY, e.g., 25-08-08 becomes 2008-08-25.
- The contents list may be truncated; extract as much as possible and use *1 if quantity not specified.
`;

      const requestBody = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: imgFile.type || "image/jpeg",
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      };

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API Error:", response.status, errorText);
        if (retries > 0 && response.status === 429) {
          toast.error(`Rate limit hit, retrying (${retries} attempts left)...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return processImageWithGemini(imgFile, retries - 1);
        }
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("Gemini API Response:", JSON.stringify(result, null, 2));

      let generatedText;
      if (
        result.candidates &&
        result.candidates[0] &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts[0] &&
        result.candidates[0].content.parts[0].text
      ) {
        generatedText = result.candidates[0].content.parts[0].text;
      } else {
        console.error("Unexpected Gemini API response structure:", result);
        if (retries > 0) {
          console.log(
            `Retrying due to invalid response (${retries} attempts left)...`
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return processImageWithGemini(imgFile, retries - 1);
        }
        throw new Error("Invalid Gemini API response structure");
      }

      console.log("Raw Gemini Response:", generatedText);

      let jsonString = generatedText;
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0]
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        if (!jsonString.endsWith("}")) {
          console.warn("Incomplete JSON detected, attempting to repair...");
          jsonString += `,"rawText": ${JSON.stringify(generatedText)} }`;
        }
      } else {
        console.warn("No JSON block found, attempting to parse text response...");
        jsonString = JSON.stringify({
          rawText: generatedText,
          barcodeNumber: "UNKNOWN",
          internalNumber: "UNKNOWN",
          distributionCode: "UNKNOWN",
          shippingDate: "UNKNOWN",
          senderName: "UNKNOWN",
          senderAddress: "UNKNOWN",
          senderPhone: "UNKNOWN",
          senderEmail: "UNKNOWN",
          recipientName: "UNKNOWN",
          recipientAddress: "UNKNOWN",
          recipientPhone: "UNKNOWN",
          totalWeight: "UNKNOWN",
          totalPieces: "UNKNOWN",
          quantity: "UNKNOWN",
          price: "UNKNOWN",
          contents: "UNKNOWN",
          additionalInfo: "UNKNOWN",
          confidenceScores: {},
        });
      }

      let extractedData;
      try {
        extractedData = JSON.parse(jsonString);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError.message);
        if (retries > 0) {
          console.log(
            `Retrying due to JSON parse error (${retries} attempts left)...`
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return processImageWithGemini(imgFile, retries - 1);
        }
        throw new Error("Failed to parse Gemini response as JSON");
      }

      if (extractedData.shippingDate && extractedData.shippingDate !== "UNKNOWN") {
        const parts = extractedData.shippingDate.split("-");
        if (parts.length === 3) {
          let year = parts[0];
          let month = parts[1];
          let day = parts[2];
          if (year.length !== 4 || parseInt(year) < 1900 || parseInt(year) > 2100) {
            day = parts[0];
            month = parts[1];
            year = parts[2];
            year = (parseInt(year) > 50 ? "19" : "20") + year.padStart(2, "0");
          }
          extractedData.shippingDate = `${year}-${month.padStart(
            2,
            "0"
          )}-${day.padStart(2, "0")}`;
        }
      }

      const scores = Object.values(extractedData.confidenceScores || {});
      const nonZeroScores = scores.filter((s) => s > 0);
      const overallConfidence = nonZeroScores.length
        ? nonZeroScores.reduce((sum, s) => sum + s, 0) / nonZeroScores.length
        : 0.85;

      if (overallConfidence < confidenceThreshold && retries > 0) {
        console.log(
          `Confidence ${overallConfidence} below threshold ${confidenceThreshold}, retrying (${retries} attempts left)...`
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return processImageWithGemini(imgFile, retries - 1);
      }

      if (overallConfidence < confidenceThreshold) {
        toast(
          `OCR results for ${imgFile.name} may be less accurate (confidence: ${(
            overallConfidence * 100
          ).toFixed(2)}%). Please verify the data.`,
          { icon: "⚠️" }
        );
      }

      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      toast.success(
        `Processed ${imgFile.name} successfully in ${duration} seconds.`
      );

      return {
        ...extractedData,
        source: "gemini",
        overallConfidence,
        fileName: imgFile.name,
      };
    } catch (error) {
      console.error("Gemini OCR Error for", imgFile.name, ":", error.message);
      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      toast.error(
        `Failed to process ${imgFile.name} in ${duration} seconds: ${error.message || "Please try a clearer image."
        }`
      );
      return {
        error: error.message || "OCR processing failed",
        rawText: "",
        confidence: 0,
        fileName: imgFile.name,
        source: "gemini",
      };
    }
  };

  // Aggregate contents across OCR results
  const aggregateContents = () => {
    const itemMap = new Map();

    ocrResults.forEach((result) => {
      if (result.contents && result.contents !== "UNKNOWN") {
        const items = result.contents.split(",").map((item) => {
          const parts = item.trim().split("*");
          let name = parts[0]?.trim() || "";
          let qty = parseInt(parts[1]?.trim()) || 1;

          name = name.toLowerCase().trim();
          const trailingNumMatch = name.match(/^(.*?)(\s+(\d+))$/);
          if (trailingNumMatch) {
            name = trailingNumMatch[1].trim();
            qty = parseInt(trailingNumMatch[3]) || qty;
          } else {
            const parenMatch = name.match(/^(.*)\((\d+)\)$/);
            if (parenMatch) {
              name = parenMatch[1].trim();
              qty = parseInt(parenMatch[2]) || qty;
            }
          }

          return { name, qty };
        });

        items.forEach((item) => {
          if (item.name) {
            const existing = itemMap.get(item.name) || { name: item.name, qty: 0 };
            existing.qty += item.qty;
            itemMap.set(item.name, existing);
          }
        });
      }
    });

    return Array.from(itemMap.values()).map((item) => ({
      name: item.name,
      qty: item.qty.toString(),
      price: "0.01",
    }));
  };

  // Handle file selection and validation
  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newPreviewUrls = [...previewUrls];
    const newOcrResults = [...ocrResults];

    for (const file of files) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast.error(
          `Invalid file type for ${file.name}. Please select JPEG or PNG images.`
        );
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 50MB limit.`);
        continue;
      }

      if (processedFilesRef.current.has(file.name)) {
        continue;
      }
      processedFilesRef.current.add(file.name);

      const startTime = performance.now();
      try {
        const compressedFile = await compressImage(file);
        const url = URL.createObjectURL(compressedFile);
        newPreviewUrls.push({ url, fileName: file.name, file: compressedFile });

        const ocrResult = await processImageWithGemini(compressedFile);
        newOcrResults.push(ocrResult);

        const endTime = performance.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        toast.success(`Processed ${file.name} successfully in ${duration} seconds.`);
      } catch (error) {
        const endTime = performance.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        toast.error(
          `Failed to process ${file.name} in ${duration} seconds: ${error.message || "Please try a clearer image."
          }`
        );
        console.error(`Processing error for ${file.name}:`, error);

        try {
          const url = URL.createObjectURL(file);
          newPreviewUrls.push({ url, fileName: file.name, file });
          const ocrResult = await processImageWithGemini(file);
          newOcrResults.push(ocrResult);

          const retryEndTime = performance.now();
          const retryDuration = ((retryEndTime - startTime) / 1000).toFixed(2);

          toast.success(
            `Processed ${file.name} (fallback) successfully in ${retryDuration} seconds.`
          );
        } catch (fallbackError) {
          const fallbackEndTime = performance.now();
          const fallbackDuration = ((fallbackEndTime - startTime) / 1000).toFixed(2);

          toast.error(
            `Failed to process ${file.name
            } (fallback) in ${fallbackDuration} seconds: ${fallbackError.message || "Please try a clearer image."
            }`
          );
          console.error(
            `Fallback processing error for ${file.name}:`,
            fallbackError
          );
        }
      }
    }

    setPreviewUrls(newPreviewUrls);
    setOcrResults(newOcrResults);
    setIsProcessing(false);
  };

  // Handle drag-and-drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Start camera
  const startCamera = async () => {
    if (!videoRef.current) {
      console.error("Video element not found");
      toast.error("Video element not ready. Please try again.");
      return;
    }

    try {
      if (!navigator.mediaDevices || !window.isSecureContext) {
        toast.error("Camera requires a secure context (HTTPS or localhost).");
        return;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      if (videoDevices.length === 0) {
        toast.error("No camera detected on this device");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current
          .play()
          .then(() => {
            console.log("Video playing successfully");
            setIsCameraActive(true);
          })
          .catch((err) => {
            console.error("Video play error:", err);
            toast.error("Failed to display camera feed.");
          });
      };
    } catch (error) {
      console.error("Camera error:", error);
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        toast.error("Camera access denied. Please allow camera permissions.");
      } else if (error.name === "NotFoundError") {
        toast.error("No compatible camera found.");
      } else {
        toast.error("Camera access failed.");
      }
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Capture photo
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          toast.error("Failed to capture image");
          return;
        }
        setIsProcessing(true);

        const fileName = `camera-capture-${Date.now()}.jpg`;
        const startTime = performance.now();
        try {
          const file = new File([blob], fileName, { type: "image/jpeg" });
          const compressedFile = await compressImage(file);
          const url = URL.createObjectURL(compressedFile);

          if (!processedFilesRef.current.has(fileName)) {
            processedFilesRef.current.add(fileName);
            const ocrResult = await processImageWithGemini(compressedFile);
            setPreviewUrls([
              ...previewUrls,
              { url, fileName, file: compressedFile },
            ]);
            setOcrResults([...ocrResults, ocrResult]);

            const endTime = performance.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            toast.success(
              `Processed ${fileName} successfully in ${duration} seconds.`
            );
          }
          stopCamera();
        } catch (error) {
          const endTime = performance.now();
          const duration = ((endTime - startTime) / 1000).toFixed(2);

          toast.error(
            `Failed to process ${fileName} in ${duration} seconds: ${error.message || "Please try a clearer image."
            }`
          );
          console.error("Capture processing error:", error);
        } finally {
          setIsProcessing(false);
        }
      },
      "image/jpeg",
      0.8
    );
  };

  // Clear specific preview
  const clearPreview = (url, fileName) => {
    setPreviewUrls(previewUrls.filter((preview) => preview.url !== url));
    setOcrResults(ocrResults.filter((result) => result.fileName !== fileName));
    URL.revokeObjectURL(url);
    processedFilesRef.current.delete(fileName);
  };

  // Clear all previews
  const clearAllPreviews = () => {
    previewUrls.forEach((preview) => {
      URL.revokeObjectURL(preview.url);
      processedFilesRef.current.delete(preview.fileName);
    });
    setPreviewUrls([]);
    setOcrResults([]);
    stopCamera();
  };

  // Navigate to RecordForm with aggregated data
  const handleNextStep = async () => {
    if (ocrResults.length === 0) {
      toast.error("Please upload or capture at least one image.");
      return;
    }

    setIsProcessing(true);
    const imageUrls = [];
    const uploadResults = await Promise.all(
      previewUrls.map(async (preview) => {
        try {
          const url = await uploadFile(preview.file);
          if (url) {
            console.log(`Uploaded image ${preview.fileName}: ${url}`);
            return { fileName: preview.fileName, url };
          } else {
            console.error(`No URL returned for ${preview.fileName}`);
            toast.error(`No URL returned for ${preview.fileName}`);
            return null;
          }
        } catch (error) {
          console.error(`Failed to upload image ${preview.fileName}:`, error);
          toast.error(
            `Failed to upload image ${preview.fileName}: ${error.message}`
          );
          return null;
        }
      })
    );

    const validUploadResults = uploadResults.filter((result) => result !== null);
    if (validUploadResults.length === 0) {
      toast.error("No images were successfully uploaded.");
      setIsProcessing(false);
      return;
    }

    validUploadResults.forEach((result) => {
      imageUrls.push(result.url);
    });

    const barcodes = ocrResults
      .filter((result) => result.barcodeNumber && result.barcodeNumber !== "UNKNOWN")
      .map((result) => result.barcodeNumber);
    const internalNumbers = ocrResults
      .filter(
        (result) => result.internalNumber && result.internalNumber !== "UNKNOWN"
      )
      .map((result) => result.internalNumber);

    // Save records and ensure all succeed before navigating
    // Inside ImageCapture.jsx, update the saveRecords function within handleNextStep
    const saveRecords = async () => {
      const savePromises = ocrResults.map(async (result) => {
        try {
          const preview = previewUrls.find((p) => p.fileName === result.fileName);
          if (!preview) {
            console.error(`No preview found for file: ${result.fileName}`);
            toast.error(`No preview found for file: ${result.fileName}`);
            return { status: "rejected", reason: "No preview found" };
          }

          const imageUrl =
            validUploadResults.find((upload) => upload.fileName === result.fileName)
              ?.url || "UNKNOWN";

          // Validate barcodeNumber and internalNumber
          const barcodeNumber = result.barcodeNumber?.trim() || "UNKNOWN";
          const internalNumber = result.internalNumber?.trim() || "UNKNOWN";

          if (barcodeNumber === "UNKNOWN") {
            console.warn(`Barcode number is UNKNOWN for ${result.fileName}`);
          }
          if (internalNumber === "UNKNOWN") {
            console.warn(`Internal number is UNKNOWN for ${result.fileName}`);
          }

          // Parse contents with validation
          const contentItems =
            result.contents && result.contents !== "UNKNOWN"
              ? result.contents
                .split(",")
                .map((item) => {
                  const parts = item.trim().split("*");
                  const name = parts[0]?.trim();
                  if (!name) {
                    console.warn(
                      `Invalid content item in ${result.fileName}: ${item}`
                    );
                    return null;
                  }
                  return {
                    name,
                    qty: parseInt(parts[1]?.trim()) || 1,
                    price: parseFloat(result.price) || 0.01,
                  };
                })
                .filter(Boolean)
              : [{ name: "Unknown Item", qty: 1, price: 0.01 }];

          const recordData = {
            clientName: "default-client",
            sender: {
              name: result.senderName?.trim() || "UNKNOWN",
              address: result.senderAddress?.trim() || "UNKNOWN",
              phone: result.senderPhone?.trim() || "UNKNOWN",
              email: result.senderEmail?.trim()?.toLowerCase() || "UNKNOWN",
            },
            recipient: {
              name: result.recipientName?.trim() || "UNKNOWN",
              address: result.recipientAddress?.trim() || "UNKNOWN",
              phone: result.recipientPhone?.trim() || "UNKNOWN",
            },
            tracking: {
              barcodeNumber,
              internalNumber,
              distributionCode: result.distributionCode?.trim() || "UNKNOWN",
              barcodeNumbers: barcodeNumber !== "UNKNOWN" ? [barcodeNumber] : [],
              internalNumbers: internalNumber !== "UNKNOWN" ? [internalNumber] : [],
            },
            additional: {
              shippingDate:
                result.shippingDate && result.shippingDate !== "UNKNOWN"
                  ? result.shippingDate
                  : undefined,
              totalWeight: parseFloat(result.totalWeight) || undefined,
              totalPieces:
                parseInt(result.totalPieces) ||
                contentItems.reduce((sum, item) => sum + item.qty, 0),
              quantity: parseInt(result.quantity) || contentItems.length,
              price:
                parseFloat(result.price) ||
                contentItems.reduce((sum, item) => sum + item.qty * item.price, 0),
            },
            contents: contentItems,
            additionalInfo: result.additionalInfo?.trim() || "UNKNOWN",
            imageUrl,
            commulativeImgUrls: [...imageUrls],
            invoiceType: "individual-invoice",
            confidenceScores: result.confidenceScores || {},
          };

          console.log(
            `Sending record data for ${result.fileName}:`,
            JSON.stringify(recordData, null, 2)
          );

          const response = await createRecord(recordData);
          console.log(`Record saved for ${result.fileName}:`, response);
          return { status: "fulfilled", value: response };
        } catch (error) {
          console.error(`Failed to save record for ${result.fileName}:`, error);
          toast.error(
            `Failed to save record for ${result.fileName}: ${error.message}`
          );
          return { status: "rejected", reason: error };
        }
      });

      const results = await Promise.allSettled(savePromises);
      let allSuccessful = true;
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `Save operation failed for record ${index + 1}:`,
            result.reason
          );
          allSuccessful = false;
        } else {
          console.log(`Save operation succeeded for record ${index + 1}`);
        }
      });

      return allSuccessful;
    };

    const allRecordsSaved = await saveRecords();
    if (!allRecordsSaved) {
      toast.error(
        "Some records failed to save. Please check the data and try again."
      );
      setIsProcessing(false);
      return;
    }

    const aggregatedContents = aggregateContents();
    const latestOcrResult = ocrResults[ocrResults.length - 1];
    // In handleNextStep, ensure the dataToPass object is correct
    const dataToPass = {
      ...latestOcrResult,
      contents: aggregatedContents
        .map((item) => `${item.name}*${item.qty}`)
        .join(", "),
      contentItems: aggregatedContents,
      totalPieces: aggregatedContents
        .reduce((sum, item) => sum + parseInt(item.qty), 0)
        .toString(),
      quantity: aggregatedContents.length.toString(),
      invoiceType: "business-invoice",
      previewUrls,
      commulativeImgUrls: [...imageUrls],
      barcodes: [...new Set(barcodes)], // Remove duplicates
      internalNumbers: [...new Set(internalNumbers)], // Remove duplicates
    };

    setIsProcessing(false);
    navigate("/record-form", {
      state: {
        initialData: dataToPass,
        imageFiles: previewUrls.map((p) => p.file),
      },
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      previewUrls.forEach((preview) => URL.revokeObjectURL(preview.url));
      processedFilesRef.current.clear();
    };
  }, [previewUrls]);

  const tabs = [
    { key: "upload", title: "Upload", icon: Upload },
    { key: "camera", title: "Camera", icon: Camera },
  ];

  return (
    <div className='p-8'>
      <div className='flex space-x-1 mb-8 justify-center gap-x-3'>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              if (tab.key === "camera") {
                setIsCameraActive(false);
              }
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${activeTab === tab.key
              ? "bg-teal-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            <tab.icon className='h-5 w-5' />
            <span>{tab.title}</span>
          </button>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className='flex items-center justify-center gap-2 mb-6 p-4  bg-amber-50 border border-amber-200 rounded-full'
      >
        <Zap className='h-5 w-5 text-amber-600' />
        <p className='text-sm sm:text-base text-amber-800 font-medium '>
          Processing time: 30-60 seconds per image
        </p>
      </motion.div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "upload" && (
          <div className='space-y-6'>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${isDragging
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                } ${isProcessing ? "pointer-events-none opacity-50" : "cursor-pointer"
                }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {isProcessing ? (
                <div className='space-y-4'>
                  <ProcessingLoader />
                </div>
              ) : (
                <div className='space-y-4'>
                  <Upload className='h-16 w-16 text-gray-400 mx-auto' />
                  <div>
                    <p className='text-xl font-medium text-gray-900 mb-2'>
                      Drop your images here, or click to browse
                    </p>
                    <p className='text-gray-500'>
                      Supports JPEG and PNG files up to 50MB each
                    </p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/jpeg,image/png'
              multiple
              onChange={(e) => handleFileSelect(Array.from(e.target.files))}
              className='hidden'
            />
          </div>
        )}

        {activeTab === "camera" && (
          <div className='space-y-6'>
            <div className='relative'>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className='w-full rounded-lg shadow-lg max-h-96 object-cover'
              />
              {!isCameraActive && (
                <div className='p-12 border-2 border-dashed border-gray-300 rounded-lg text-center'>
                  <button
                    onClick={startCamera}
                    className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
                  >
                    Start Camera
                  </button>
                </div>
              )}
              {isCameraActive && (
                <div>
                  <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 space-x-4'>
                    <button
                      onClick={capturePhoto}
                      disabled={isProcessing}
                      className='px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium disabled:opacity-50'
                    >
                      {isProcessing ? "Processing..." : "Capture"}
                    </button>
                    <button
                      onClick={stopCamera}
                      className='px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors font-medium'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {previewUrls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='mt-6'
          >
            <h2 className='text-xl font-medium text-gray-900 mb-4'>Previews</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
              {previewUrls.map((preview) => {
                const ocrResult = ocrResults.find(
                  (result) => result.fileName === preview.fileName
                );
                return (
                  <div
                    key={preview.url}
                    className='relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300'
                  >
                    <div
                      className={`${ocrResult?.error
                        ? "bg-gradient-to-r from-red-500 to-red-600"
                        : "bg-gradient-to-r from-green-500 to-green-600"
                        } px-4 py-3 flex items-center justify-between`}
                    >
                      <div className='flex items-center gap-2'>
                        {ocrResult?.error ? (
                          <X className='h-5 w-5 text-white' />
                        ) : (
                          <svg
                            className='h-5 w-5 text-white'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M5 13l4 4L19 7'
                            />
                          </svg>
                        )}
                        <span className='text-white font-medium text-sm'>
                          {ocrResult?.error
                            ? "Poor Image Quality"
                            : "Image Processed Successfully"}
                        </span>
                      </div>
                      <button
                        onClick={() => clearPreview(preview.url, preview.fileName)}
                        className='p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors'
                      >
                        <X className='h-4 w-4 text-white' />
                      </button>
                    </div>

                    <div className='p-4 bg-transparent'>
                      <div className='relative bg-gray-50 rounded-lg overflow-hidden'>
                        <img
                          src={preview.url}
                          alt={preview.fileName}
                          className='w-full h-48 object-contain'
                        />
                      </div>
                      <p className='text-sm text-gray-700 mt-3 font-medium truncate'>
                        {preview.fileName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className='flex justify-end gap-x-4 mt-6'>
              <button
                onClick={clearAllPreviews}
                className='px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg'
              >
                Clear All
              </button>
              <button
                onClick={handleNextStep}
                disabled={isProcessing}
                className='px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium flex items-center shadow-md hover:shadow-lg disabled:opacity-50'
              >
                {isProcessing ? "Processing..." : "Next Step"}
                <ChevronRight className='h-5 w-5 ml-2' />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      <canvas ref={canvasRef} className='hidden' />
    </div>
  );
};

export default ImageCapture;
