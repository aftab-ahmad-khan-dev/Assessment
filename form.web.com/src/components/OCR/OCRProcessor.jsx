import React, { useEffect, useRef } from "react";
import { createWorker } from "tesseract.js";
import { preprocessImage } from "../../utils/ocr.js";
import { extractFieldsFromText } from "../../utils/regex.js";
import toast from "react-hot-toast";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_SECRET;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const OCRProcessor = ({ image, onComplete, onProgress }) => {
  const ocrProcessedRef = useRef(false);

  // Convert File to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  // Fallback Tesseract processing
  const processWithTesseract = async (imgFile) => {
    try {
      console.log("Tesseract processing image:", imgFile.name, imgFile.size);
      onProgress(10);
      const preprocessedImage = await preprocessImage(imgFile);
      onProgress(30);

      const worker = await createWorker("eng");
      onProgress(50);

      await worker.setParameters({
        tessedit_char_whitelist:
          "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,+-/:()[]@#*",
        tessedit_pageseg_mode: "6",
      });
      onProgress(60);

      const { data } = await worker.recognize(preprocessedImage);
      onProgress(80);

      const extractedData = extractFieldsFromText(data.text);
      await worker.terminate();
      onProgress(100);

      return {
        ...extractedData,
        rawText: data.text,
        confidence: data.confidence,
        source: "tesseract",
      };
    } catch (error) {
      throw error;
    }
  };

  // Parse text response to JSON when Gemini doesn't return valid JSON
  const parseTextToJson = (text) => {
    const data = {
      barcodeNumber: "UNKNOWN",
      internalNumber: "UNKNOWN",
      distributionCode: "UNKNOWN",
      shippingDate: new Date().toISOString().split("T")[0],
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
      rawText: text,
    };

    const lines = text.split("\n");
    lines.forEach((line) => {
      // Handle Tracking Number
      if (line.includes("Tracking Number:") || line.match(/\d{12,}/)) {
        data.barcodeNumber =
          line.match(/Tracking Number:\s*(\d+)/)?.[1] ||
          line.match(/\d{12,}/)?.[0] ||
          "UNKNOWN";
        data.confidenceScores.barcodeNumber = 0.95;
      }
      // Handle Reference Number
      if (line.includes("Reference Number:") || line.includes("Ref No")) {
        data.internalNumber =
          line.match(/Reference Number:\s*(\w+)/)?.[1] ||
          line.match(/Ref No\s*(\w+)/)?.[1] ||
          "UNKNOWN";
        data.confidenceScores.internalNumber = 0.9;
      }
      // Handle Order Number
      if (line.includes("Order Number:") || line.includes("KWT")) {
        data.distributionCode =
          line.match(/Order Number:\s*(\w+)/)?.[1] ||
          line.match(/KWT\s*\w+\s*\w+/)?.[0] ||
          "UNKNOWN";
        data.confidenceScores.distributionCode = 0.85;
      }
      // Handle Ship Date
      if (line.includes("Ship Date:") || line.includes("ShipDate:")) {
        data.shippingDate =
          line.match(/Ship Date:\s*(\d{4}-\d{2}-\d{2})/)?.[1] ||
          line.match(/ShipDate:\s*(\d{4}-\d{2}-\d{2})/)?.[1] ||
          "UNKNOWN";
        data.confidenceScores.shippingDate = 0.8;
      }
      // Handle Shipper
      if (line.includes("Shipper:") || line.includes("SHEIN")) {
        data.senderName =
          line.match(/Shipper:\s*([^,]+)/)?.[1].trim() ||
          line.match(/SHEIN-\w+/)?.[0] ||
          "UNKNOWN";
        data.confidenceScores.senderName = 0.9;
      }
      // Handle Shipper Address
      if (line.includes("Shipper Address:") || line.includes("Prologis")) {
        data.senderAddress =
          line.match(/Shipper Address:\s*(.+)/)?.[1] ||
          line.match(/Prologis.*?(CHN|Kuwait)/)?.[0] ||
          "UNKNOWN";
        data.confidenceScores.senderAddress = 0.85;
      }
      // Handle Sender Phone
      if (line.includes("Phone:") || line.match(/Call:\s*(\+\d+)/)) {
        data.senderPhone =
          line.match(/Phone:\s*(\+?\d+)/)?.[1] ||
          line.match(/Call:\s*(\+\d+)/)?.[1] ||
          "UNKNOWN";
        data.confidenceScores.senderPhone = 0.95;
      }
      // Handle Sender Email
      if (line.includes("Email:") || line.match(/Email:\s*(\S+@\S+)/)) {
        data.senderEmail = line.match(/Email:\s*(\S+@\S+)/)?.[1] || "UNKNOWN";
        data.confidenceScores.senderEmail = 0.95;
      }
      // Handle Recipient
      if (
        line.includes("Recipient:") ||
        line.match(/[اأإآبتثجحخدذرزسشصضطظعغفقكلمنهويةى]/)
      ) {
        data.recipientName =
          line
            .match(/Recipient:\s*(.+)/)?.[1]
            .split("(")[0]
            .trim() ||
          line.match(/[اأإآبتثجحخدذرزسشصضطظعغفقكلمنهويةى]+.*?(لوجستك)?/)?.[0] ||
          "UNKNOWN";
        data.confidenceScores.recipientName = 0.9;
        const phones = line.match(/(\+\d+)/g);
        if (phones) {
          data.recipientPhone = phones.join(",");
          data.confidenceScores.recipientPhone = 0.95;
        }
      }
      // Handle Recipient Address
      if (line.includes("Recipient Address:") || line.includes("Al Farwaniyah")) {
        data.recipientAddress =
          line.match(/Recipient Address:\s*(.+)/)?.[1] ||
          line.match(/Al Farwaniyah.*?(Kuwait|منزل \d+)/)?.[0] ||
          "UNKNOWN";
        data.confidenceScores.recipientAddress = 0.85;
      }
      // Handle Gross Weight
      if (line.includes("Gross Weight") || line.includes("G.W")) {
        const weightMatch =
          line.match(/Gross Weight.*?:\s*([\d.]+).*?(kg)?/) ||
          line.match(/G.W\s*([\d.]+)\s*kg/)?.[1];
        data.totalWeight = weightMatch ? weightMatch[1] : "UNKNOWN";
        data.confidenceScores.totalWeight = 0.9;
      }
      // Handle Total Quantity
      if (line.includes("Total Quantity:") || line.includes("Qty")) {
        data.quantity =
          line.match(/Total Quantity:\s*(\d+)/)?.[1] ||
          line.match(/Qty\s*(\d+)/)?.[1] ||
          "UNKNOWN";
        data.confidenceScores.quantity = 0.85;
      }
      // Handle Price Paid
      if (line.includes("Price Paid") || line.includes("PPD")) {
        const priceMatch =
          line.match(/Price Paid.*?:\s*([\d.]+)\s*KWD/) ||
          line.match(/PPD\s*([\d.]+)\s*\(KWD\)/)?.[1];
        data.price = priceMatch ? priceMatch[1] : "UNKNOWN";
        data.confidenceScores.price = 0.9;
      }
      // Handle Items
      if (line.includes("Items:") || line.match(/Women's.*?\*\d+/)) {
        const itemsMatch =
          line.match(/Items:\s*(.+)/) ||
          line.match(/(Women's.*?\*\d+(?:,\s*Women's.*?\*\d+)*)/);
        if (itemsMatch) {
          const items = itemsMatch[1].split(",").map((item) => item.trim());
          data.contents = items
            .map((item) => {
              const trailingNumMatch = item.match(/^(.*?)(\s+(\d+))$/);
              if (trailingNumMatch) {
                return `${trailingNumMatch[1].trim()}*${trailingNumMatch[3]}`;
              }
              const parenMatch = item.match(/^(.*)\((\d+)\)$/);
              if (parenMatch) {
                return `${parenMatch[1].trim()}*${parenMatch[2]}`;
              }
              return `${item}*1`;
            })
            .join(",");
          data.confidenceScores.contents = 0.8;
        }
      }
      // Handle Order Type (additionalInfo)
      if (line.includes("Order Type:") || line.match(/Dropship\s*(Normal|Kuwait)/)) {
        // Explicitly exclude email and phone from additionalInfo
        if (!line.match(/Email\s*:/) && !line.match(/Call\s*:/)) {
          data.additionalInfo =
            line.match(/Order Type:\s*(.+)/)?.[1] ||
            line.match(/Dropship\s*(Normal|Kuwait)/)?.[0] ||
            "UNKNOWN";
          data.confidenceScores.additionalInfo = 0.85;
        }
      }
    });

    return data;
  };

  const processImageWithGemini = async (
    imgFile = image,
    retries = 5,
    maxRetries = 5
  ) => {
    const confidenceThreshold = 0.9; // Desired confidence threshold
    try {
      console.log("OCRProcessor processing image:", imgFile.name, imgFile.size);
      onProgress(10);
      const base64Image = await fileToBase64(imgFile);
      onProgress(30);

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
- The senderEmail is the email labeled "Email:" at the bottom of the label, e.g., "Email:nawaft@hotmail.com".
- The senderPhone is the phone labeled "Call:" at the bottom of the label, e.g., "Call:+96522252186".
- Do not include the email or phone in additionalInfo; additionalInfo should only include order type information like "Dropship Order, Normal, KWT ST8".
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
                  mime_type: "image/jpeg",
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

      onProgress(50);
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API Error:", response.status, errorText);
        if (retries > 0 && response.status === 429) {
          console.log(`Rate limit hit, retrying (${retries} attempts left)...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return processImageWithGemini(imgFile, retries - 1, maxRetries);
        }
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log(
        "OCRProcessor Full Gemini API Response:",
        JSON.stringify(result, null, 2)
      );
      onProgress(70);

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
      } else if (
        result.candidates &&
        result.candidates[0] &&
        result.candidates[0].text
      ) {
        generatedText = result.candidates[0].text;
      } else if (
        result.candidates &&
        result.candidates[0] &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts[0]
      ) {
        console.warn("Empty text in parts[0], attempting fallback parsing...");
        generatedText = "{}";
      } else {
        console.error("Unexpected Gemini API response structure:", result);
        if (retries > 0) {
          console.log(
            `Retrying due to invalid response (${retries} attempts left)...`
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return processImageWithGemini(imgFile, retries - 1, maxRetries);
        }
        throw new Error("Invalid Gemini API response structure");
      }

      console.log("OCRProcessor Raw Gemini Response:", generatedText);

      let jsonString = generatedText;
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0]
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        console.log("OCRProcessor Extracted JSON:", jsonString);
        if (!jsonString.endsWith("}")) {
          console.warn("Incomplete JSON detected, attempting to repair...");
          jsonString += `,"rawText": ${JSON.stringify(generatedText)} }`;
        }
      } else {
        console.warn("No JSON block found, attempting to parse text response...");
        const parsedData = parseTextToJson(generatedText);
        jsonString = JSON.stringify(parsedData);
        console.log("OCRProcessor Parsed JSON from text:", jsonString);
      }

      let extractedData;
      try {
        extractedData = JSON.parse(jsonString);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError.message);
        console.error("Problematic JSON:", jsonString);
        if (retries > 0) {
          console.log(
            `Retrying due to JSON parse error (${retries} attempts left)...`
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return processImageWithGemini(imgFile, retries - 1, maxRetries);
        }
        console.warn("Falling back to text parsing due to invalid JSON...");
        const parsedData = parseTextToJson(generatedText);
        jsonString = JSON.stringify(parsedData);
        extractedData = JSON.parse(jsonString);
        console.log("OCRProcessor Parsed JSON from text:", jsonString);
      }

      if (extractedData.shippingDate) {
        const parts = extractedData.shippingDate.split("-");
        if (parts.length === 3) {
          let year = parts[0];
          let month = parts[1];
          let day = parts[2];
          if (year.length !== 4 || parseInt(year) < 1900 || parseInt(year) > 2100) {
            // Assume DD-MM-YY
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

      // Calculate overallConfidence from average of confidenceScores
      const scores = Object.values(extractedData.confidenceScores || {});
      const nonZeroScores = scores.filter((s) => s > 0);
      let overallConfidence = nonZeroScores.length
        ? nonZeroScores.reduce((sum, s) => sum + s, 0) / nonZeroScores.length
        : 0.85;

      // Check if confidence is sufficient
      if (overallConfidence < confidenceThreshold && retries > 0) {
        console.log(
          `Confidence ${overallConfidence} below threshold ${confidenceThreshold}, retrying (${retries} attempts left)...`
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return processImageWithGemini(imgFile, retries - 1, maxRetries);
      }

      if (overallConfidence < confidenceThreshold) {
        console.warn(
          `Max retries (${maxRetries}) reached with confidence ${overallConfidence}. Proceeding with results.`
        );
        toast(
          `OCR results may be less accurate (confidence: ${(
            overallConfidence * 100
          ).toFixed(2)}%). Please verify the data.`,
          { icon: "⚠️" }
        );
      }

      onProgress(100);
      return {
        ...extractedData,
        source: "gemini",
        overallConfidence,
      };
    } catch (error) {
      console.error("Gemini OCR Error:", error.message, error.stack);
      console.log("Falling back to Tesseract...");
      toast.error("Gemini failed, falling back to Tesseract...");
      try {
        const fallbackData = await processWithTesseract(imgFile);
        return fallbackData;
      } catch (fallbackError) {
        console.error("Tesseract Fallback Error:", fallbackError.message);
        throw new Error("Both OCR methods failed. Please try a clearer image.");
      }
    }
  };

  useEffect(() => {
    if (image && !ocrProcessedRef.current) {
      ocrProcessedRef.current = true;
      processImageWithGemini()
        .then((data) => {
          console.log("OCRProcessor extracted data:", data);
          onComplete(data);
        })
        .catch((error) => {
          console.error("OCRProcessor error:", error);
          toast.error(error.message || "OCR processing failed.");
          onComplete({
            error: error.message || "OCR processing failed.",
            rawText: "",
            confidence: 0,
          });
        });
    }
  }, [image, onComplete]);

  return null;
};

export default OCRProcessor;
