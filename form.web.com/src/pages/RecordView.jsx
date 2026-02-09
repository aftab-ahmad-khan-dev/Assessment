import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";
import {
  ArrowLeft,
  Edit3,
  Download,
  Trash2,
  Save,
  X,
  Image as ImageIcon,
  Calendar,
  Package,
  User,
  Printer,
  MapPin,
  Phone,
  FileText,
  Hash,
  Plus,
  Trash,
} from "lucide-react";
import toast from "react-hot-toast";
import { useApi } from "../context/ApiContext.jsx";
import Button from "../components/UI/Button.jsx";
import Input from "../components/UI/Input.jsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import AmiriRegular from "./Amiri-Regular.ttf";

const RecordView = ({ isEdit = false }) => {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const { getRecord, updateRecord, deleteRecord } = useApi();
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(isEdit);
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const BaseUrl = import.meta.env.VITE_BASE_URL;
  const FileUrl = import.meta.env.VITE_FILE_URL;

  useEffect(() => {
    loadRecord();
  }, [recordId]);

  const loadRecord = async () => {
    try {
      setIsLoading(true);
      const response = await getRecord(recordId);
      if (!response.data) {
        throw new Error("Record not found");
      }
      setRecord(response.data);
      setFormData({
        ...response.data,
        contents: response.data.contents || [],
        barcodeNumbers: response.data.tracking?.barcodeNumbers || [],
        internalNumbers: response.data.tracking?.internalNumbers || [],
      });
    } catch (error) {
      toast.error("Failed to load record: " + error.message);
      console.error("Error loading record:", error);
      navigate("/records");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value, index = null) => {
    setFormData((prev) => {
      if (field === "barcodeNumbers" || field === "internalNumbers") {
        if (index !== null) {
          const newArray = [...prev[field]];
          newArray[index] = value.trim();
          return { ...prev, [field]: newArray };
        } else {
          return {
            ...prev,
            [field]:
              typeof value === "string"
                ? value
                  .split(",")
                  .map((v) => v.trim())
                  .filter((v) => v)
                : value,
          };
        }
      }
      return {
        ...prev,
        [field]: field === "shippingDate" ? new Date(value).toISOString() : value,
      };
    });
  };

  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleContentChange = (index, field, value) => {
    setFormData((prev) => {
      const newContents = [...prev.contents];
      newContents[index] = {
        ...newContents[index],
        [field]: value,
      };
      return { ...prev, contents: newContents };
    });
  };

  const addContentItem = () => {
    setFormData((prev) => ({
      ...prev,
      contents: [...prev.contents, { name: "", qty: 1, price: 0 }],
    }));
  };

  const removeContentItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      contents: prev.contents.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const isBusinessInvoice = formData.invoiceType === "business-invoice";
      const nestedData = {
        tracking: {
          barcodeNumbers: isBusinessInvoice
            ? formData.barcodeNumbers || []
            : [formData.barcodeNumber || ""],
          internalNumbers: isBusinessInvoice
            ? formData.internalNumbers || []
            : [formData.internalNumber || ""],
          distributionCode: formData.distributionCode,
        },
        sender: {
          name: formData.senderName,
          phone: formData.senderPhone,
          email: formData.senderEmail,
          address: formData.senderAddress,
        },
        recipient: {
          name: formData.recipientName,
          phone: formData.recipientPhone,
          address: formData.recipientAddress,
        },
        additional: {
          city: formData.city,
          shippingDate: formData.shippingDate,
          totalWeight: Number(formData.totalWeight) || 0,
          totalPieces: Number(formData.totalPieces) || 0,
          quantity: Number(formData.quantity) || 0,
          price: Number(formData.price) || 0,
          parcels: formData.parcels,
          paymentMethod: formData.paymentMethod,
        },
        contents: formData.contents.map((item) => ({
          name: item.name,
          qty: Number(item.qty) || 1,
          price: Number(item.price) || 0,
        })),
        additionalInfo: formData.additionalInfo,
        confidenceScores: formData.confidenceScores,
        commulativeImgUrls: formData.commulativeImgUrls || [],
        invoiceType: formData.invoiceType,
      };
      console.log("Sending update payload:", nestedData);
      await updateRecord(recordId, nestedData);
      const refreshResponse = await getRecord(recordId);
      setRecord(refreshResponse.data);
      setFormData({
        ...refreshResponse.data,
        contents: refreshResponse.data.contents || [],
        barcodeNumbers: refreshResponse.data.tracking?.barcodeNumbers || [],
        internalNumbers: refreshResponse.data.tracking?.internalNumbers || [],
      });
      setIsEditing(false);
      toast.success("Record updated successfully!");
    } catch (error) {
      toast.error("Failed to update record: " + error.message);
      console.error("Error updating record:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      ...record,
      contents: record.contents || [],
      barcodeNumbers: record.tracking?.barcodeNumbers || [],
      internalNumbers: record.tracking?.internalNumbers || [],
    });
    setIsEditing(false);
  };

  const handlePrint = () => {
    if (!record) {
      toast.error("Cannot print: No record data available");
      console.error("Print attempted but record is null");
      return;
    }
    setTimeout(() => {
      console.log("Printing record:", record);
      window.print();
    }, 100);
  };

  const handleExportPDF = async () => {
    if (!record) {
      toast.error("Cannot export PDF: No record data available");
      console.error("Export PDF attempted but record is null");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;

    doc.addFont(AmiriRegular, "Amiri", "normal");
    doc.addFont(AmiriRegular, "Amiri", "bold");
    doc.setFont("Amiri", "normal");

    const isArabic = (text) => {
      const arabicRegex = /[\u0600-\u06FF]/;
      return arabicRegex.test(text);
    };

    const checkPageBreak = (requiredHeight) => {
      if (y + requiredHeight > pageHeight - margin - 10) {
        doc.addPage();
        y = margin;
        addHeader();
      }
    };

    const addHeader = () => {
      try {
        const logoImg = new Image();
        logoImg.src = logo;
        logoImg.crossOrigin = "anonymous";
        doc.addImage(logoImg, "PNG", margin, y, 40, 15);
      } catch (error) {
        console.error("Failed to load logo for PDF:", error);
      }

      doc.setFont("Amiri", "bold");
      doc.setFontSize(16);
      const headerText = `Barcode: ${record.barcodeNumber || record.clientId}`;
      const headerWidth = doc.getTextWidth(headerText);
      doc.text(headerText, pageWidth - margin - headerWidth, y + 5);

      doc.setFont("Amiri", "normal");
      doc.setFontSize(10);
      const subHeaderText = `• ${new Date(record.createdAt).toLocaleDateString()}`;
      const subHeaderWidth = doc.getTextWidth(subHeaderText);
      doc.text(subHeaderText, pageWidth - margin - subHeaderWidth, y + 12);

      doc.setLineWidth(0.5);
      doc.line(margin, y + 20, pageWidth - margin, y + 20);
      y += 25;
    };

    const addFooter = () => {
      doc.setFont("Amiri", "normal");
      doc.setFontSize(8);
      doc.text(
        `Page ${doc.getNumberOfPages()}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: "right" }
      );
    };

    addHeader();

    const isBusinessInvoice = record.invoiceType === "business-invoice";
    if (isBusinessInvoice && record.commulativeImgUrls?.length > 0) {
      checkPageBreak(60);
      doc.setFont("Amiri", "bold");
      doc.setFontSize(14);
      doc.text("Images", margin, y);
      y += 8;

      for (const [index, imgFileName] of record.commulativeImgUrls.entries()) {
        const imgUrl = `${FileUrl}/${imgFileName}`;
        try {
          const response = await fetch(imgUrl);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status} for ${imgUrl}`);
          }
          const blob = await response.blob();
          const imgData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          checkPageBreak(50);
          doc.addImage(imgData, "JPEG", margin, y, 50, 50);
          doc.setFont("Amiri", "normal");
          doc.setFontSize(10);
          doc.text(`Image ${index + 1}`, margin, y + 55);
          y += 60;
        } catch (error) {
          console.error(`Failed to load image ${imgUrl} for PDF:`, error);
          doc.setFont("Amiri", "normal");
          doc.setFontSize(10);
          doc.text(`Image ${index + 1}: Not available`, margin, y);
          y += 10;
        }
      }
      y += 5;
    }

    if (!isBusinessInvoice) {
      const trackingGroup = fieldGroups.find(
        (group) => group.title === "Tracking Information"
      );
      if (trackingGroup) {
        checkPageBreak(50);
        doc.setFont("Amiri", "bold");
        doc.setFontSize(14);
        doc.text(trackingGroup.title, margin, y);
        y += 8;

        trackingGroup.fields
          .filter((field) =>
            ["barcodeNumber", "internalNumber", "distributionCode"].includes(
              field.key
            )
          )
          .forEach((field) => {
            const value = record[field.key] || "Not specified";
            const labelText = `${field.label}:`;
            const isValueArabic = isArabic(value);
            const textAlign = isValueArabic ? "right" : "left";
            const labelWidth = 50;
            const valueWidth = pageWidth - margin - 65;
            const wrappedLabel = doc.splitTextToSize(labelText, labelWidth);
            const wrappedValue = doc.splitTextToSize(value, valueWidth);
            const lineHeight =
              Math.max(wrappedLabel.length, wrappedValue.length) * 6 + 4;

            checkPageBreak(lineHeight);

            doc.setFont("Amiri", "bold");
            doc.setFontSize(10);
            doc.text(wrappedLabel, margin, y, { align: "left" });

            doc.setFont("Amiri", "normal");
            const xPosition = isValueArabic ? pageWidth - margin : margin + 55;
            doc.text(wrappedValue, xPosition, y, { align: textAlign });
            y += lineHeight;
          });
        y += 5;
      }
    } else {
      checkPageBreak(50);
      doc.setFont("Amiri", "bold");
      doc.setFontSize(14);
      doc.text("Business Invoice Information", margin, y);
      y += 8;

      ["barcodeNumbers", "internalNumbers"].forEach((key) => {
        const label =
          key === "barcodeNumbers" ? "Barcode Numbers" : "Internal Numbers";
        const values = record[key] || [];
        const labelText = `${label}:`;
        const valueText = values.length > 0 ? values.join(", ") : "Not specified";
        const isValueArabic = isArabic(valueText);
        const textAlign = isValueArabic ? "right" : "left";
        const labelWidth = 50;
        const valueWidth = pageWidth - margin - 65;
        const wrappedLabel = doc.splitTextToSize(labelText, labelWidth);
        const wrappedValue = doc.splitTextToSize(valueText, valueWidth);
        const lineHeight =
          Math.max(wrappedLabel.length, wrappedValue.length) * 6 + 4;

        checkPageBreak(lineHeight);

        doc.setFont("Amiri", "bold");
        doc.setFontSize(10);
        doc.text(wrappedLabel, margin, y, { align: "left" });

        doc.setFont("Amiri", "normal");
        const xPosition = isValueArabic ? pageWidth - margin : margin + 55;
        doc.text(wrappedValue, xPosition, y, { align: textAlign });
        y += lineHeight;
      });
      y += 5;
    }

    const packageGroup = fieldGroups.find(
      (group) => group.title === "Package Details"
    );
    if (packageGroup) {
      checkPageBreak(100);
      doc.setFont("Amiri", "bold");
      doc.setFontSize(14);
      doc.text(packageGroup.title, margin, y);
      y += 8;

      packageGroup.fields.forEach((field) => {
        const value =
          field.key === "shippingDate" && record[field.key]
            ? new Date(record[field.key]).toLocaleDateString()
            : record[field.key] || "Not specified";
        const labelText = `${field.label}:`;
        const isValueArabic = isArabic(value);
        const textAlign = isValueArabic ? "right" : "left";
        const labelWidth = 50;
        const valueWidth = pageWidth - margin - 65;
        const wrappedLabel = doc.splitTextToSize(labelText, labelWidth);
        const wrappedValue = doc.splitTextToSize(value, valueWidth);
        const lineHeight =
          Math.max(wrappedLabel.length, wrappedValue.length) * 6 + 4;

        checkPageBreak(lineHeight);

        doc.setFont("Amiri", "bold");
        doc.setFontSize(10);
        doc.text(wrappedLabel, margin, y, { align: "left" });

        doc.setFont("Amiri", "normal");
        const xPosition = isValueArabic ? pageWidth - margin : margin + 55;
        doc.text(wrappedValue, xPosition, y, { align: textAlign });
        y += lineHeight;
      });
      y += 5;

      const contentsGroup = fieldGroups.find((group) => group.key === "contents");
      if (contentsGroup && record.contents && record.contents.length > 0) {
        checkPageBreak(50);
        doc.setFont("Amiri", "bold");
        doc.setFontSize(14);
        doc.text(contentsGroup.title, margin, y);
        y += 8;

        doc.autoTable({
          startY: y,
          head: [["Name", "Quantity", "Price (KWD)"]],
          body: record.contents.map((item) => [
            item.name,
            item.qty,
            item.price.toFixed(2),
          ]),
          theme: "striped",
          styles: { font: "Amiri", fontSize: 10 },
          headStyles: { fillColor: [0, 102, 204], textColor: 255 },
          margin: { left: margin, right: margin },
        });
        y = doc.lastAutoTable.finalY + 10;

        const totalQty = record.contents.reduce(
          (sum, item) => sum + (Number(item.qty) || 0),
          0
        );
        const totalPrice = record.contents.reduce(
          (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1),
          0
        );

        checkPageBreak(20);
        doc.setFont("Amiri", "bold");
        doc.setFontSize(12);
        doc.text(`Total Quantity: ${totalQty}`, margin, y);
        y += 8;
        doc.text(`Total Price: ${totalPrice.toFixed(2)} KWD`, margin, y);
        y += 10;
      } else {
        checkPageBreak(20);
        doc.setFont("Amiri", "normal");
        doc.setFontSize(10);
        doc.text("No contents specified", margin, y);
        y += 10;
      }
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addFooter();
    }

    try {
      await doc.save(
        `Shipping_Record_${record.barcodeNumber || record.clientId}.pdf`,
        { returnPromise: true }
      );
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("Failed to save PDF:", error);
      toast.error("Failed to export PDF");
    }
  };

  const handleDownloadImage = async (imageUrl, fileName) => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${imageUrl}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        fileName || `scanned_image_${record.barcodeNumber || record.clientId}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download image");
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalIsOpen(true);
  };

  const fieldGroups = [
    {
      title: "Business Invoice Information",
      icon: FileText,
      fields: [
        { key: "barcodeNumbers", label: "Barcode Numbers", type: "array" },
        { key: "internalNumbers", label: "Tracking Numbers", type: "array" },
      ],
    },
    {
      title: "Sender Information",
      icon: User,
      fields: [
        { key: "senderName", label: "Sender Name", type: "text" },
        { key: "senderAddress", label: "Sender Address", type: "textarea" },
        { key: "senderPhone", label: "Sender Phone", type: "text" },
        { key: "senderEmail", label: "Sender Email", type: "email" },
      ],
    },
    {
      title: "Recipient Information",
      icon: MapPin,
      fields: [
        { key: "recipientName", label: "Recipient Name", type: "text" },
        { key: "recipientAddress", label: "Recipient Address", type: "textarea" },
        { key: "recipientPhone", label: "Recipient Phone", type: "text" },
      ],
    },
    {
      title: "Package Details",
      icon: Package,
      fields: [
        { key: "city", label: "City", type: "text" },
        { key: "shippingDate", label: "Shipping Date", type: "date" },
        { key: "totalWeight", label: "Total Weight (kg)", type: "number" },
        { key: "totalPieces", label: "Total Pieces", type: "number" },
        { key: "quantity", label: "Quantity", type: "number" },
        { key: "price", label: "Price (KWD)", type: "number" },
        { key: "parcels", label: "Parcels", type: "text" },
        { key: "paymentMethod", label: "Payment Method", type: "text" },
        { key: "additionalInfo", label: "Additional Information", type: "textarea" },
      ],
    },
    {
      title: "Contents",
      icon: Package,
      key: "contents",
      fields: [],
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Record not found</p>
      </div>
    );
  }

  const isBusinessInvoice = record.invoiceType === "business-invoice";
  const imageSrc = isBusinessInvoice
    ? record.commulativeImgUrls?.[0]
      ? `${FileUrl}/${record.commulativeImgUrls[0]}`
      : "/placeholder-image.jpg"
    : `${FileUrl}/${record.imageUrl}` || "/placeholder-image.jpg";

  return (
    <>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 space-y-4 sm:space-y-6">
        {/* Back Button */}
        <div className="pt-2 sm:pt-4">
          <Link to="/records">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">Back to Records</span>
              <span className="xs:hidden">Back</span>
            </Button>
          </Link>
        </div>

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {record.barcodeNumber === "UNKNOWN"
                    ? "No Barcode"
                    : record.barcodeNumber}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">
                  {record.recipientName === "UNKNOWN"
                    ? "No Specific Recipient"
                    : record.recipientName}{" "}
                  • {new Date(record.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">Cancel</span>
                  <span className="xs:hidden">Cancel</span>
                </Button>
                <Button
                  onClick={handleSave}
                  isLoading={isSaving}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">Save Changes</span>
                  <span className="xs:hidden">Save</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Edit3 className="h-4 w-4 mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">Edit</span>
                  <span className="xs:hidden">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Printer className="h-4 w-4 mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">Print</span>
                  <span className="xs:hidden">Print</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportPDF}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">Export PDF</span>
                  <span className="xs:hidden">PDF</span>
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 w-full sm:w-auto"
                  size="sm"
                  onClick={() => {
                    if (
                      window.confirm("Are you sure you want to delete this record?")
                    ) {
                      deleteRecord(recordId)
                        .then(() => {
                          toast.success("Record deleted successfully!");
                          navigate("/records");
                        })
                        .catch((error) => {
                          toast.error("Failed to delete record: " + error.message);
                          console.error("Error deleting record:", error);
                        });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">Delete</span>
                  <span className="xs:hidden">Delete</span>
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Image Section */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-blue-600" />
                {isBusinessInvoice ? "Scanned Images" : "Scanned Image"}
              </h3>
              {isBusinessInvoice ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {record.commulativeImgUrls?.length > 0 ? (
                    record.commulativeImgUrls.map((imgFileName, index) => {
                      const imgUrl = `${FileUrl}/${imgFileName}`;
                      return (
                        <div
                          key={index}
                          className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group"
                        >
                          <img
                            src={imgUrl}
                            alt={`Scanned Image ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onError={(e) => {
                              e.target.src = "/placeholder-image.jpg";
                              console.error(`Failed to load image: ${imgUrl}`);
                            }}
                            onClick={() => openImageModal(imgUrl)}
                          />
                          <button
                            onClick={() => openImageModal(imgUrl)}
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                          >
                            <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-gray-400 italic col-span-2 text-center py-8 text-xs sm:text-sm">
                      No images available
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group">
                  <img
                    src={imageSrc}
                    alt="Shipping sticker"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onError={(e) => {
                      e.target.src = "/placeholder-image.jpg";
                      console.error("Failed to load image:", imageSrc);
                    }}
                    onClick={() => openImageModal(imageSrc)}
                  />
                  {record.imageUrl && (
                    <button
                      onClick={() => openImageModal(imageSrc)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                    >
                      <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Form Fields */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4 sm:space-y-6"
          >
            {fieldGroups.map((group) => (
              <div
                key={group.title}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6"
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <group.icon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-blue-600" />
                  {group.title}
                </h3>

                {group.key === "contents" ? (
                  <div>
                    {isEditing ? (
                      <div className="space-y-3 sm:space-y-4">
                        {formData.contents.map((item, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 items-end"
                          >
                            <div className="sm:col-span-1">
                              <Input
                                label="Item Name"
                                type="text"
                                value={item.name}
                                onChange={(e) =>
                                  handleContentChange(index, "name", e.target.value)
                                }
                                className="text-xs sm:text-sm"
                              />
                            </div>
                            <div>
                              <Input
                                label="Qty"
                                type="number"
                                value={item.qty}
                                onChange={(e) =>
                                  handleContentChange(index, "qty", e.target.value)
                                }
                                className="text-xs sm:text-sm"
                              />
                            </div>
                            <div className="flex gap-1 sm:gap-2">
                              <Input
                                label="Price (KWD)"
                                type="number"
                                step="0.01"
                                value={item.price}
                                onChange={(e) =>
                                  handleContentChange(index, "price", e.target.value)
                                }
                                className="text-xs sm:text-sm flex-1"
                              />
                              <Button
                                variant="outline"
                                className="text-red-600 hover:bg-red-50 p-2"
                                onClick={() => removeContentItem(index)}
                              >
                                <Trash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={addContentItem}
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          <Plus className="h-4 w-4 mr-1.5 sm:mr-2" />
                          Add Item
                        </Button>
                      </div>
                    ) : (
                      <div>
                        {record.contents.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[500px] border-collapse text-xs sm:text-sm">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="border border-gray-200 px-2 sm:px-4 py-2 text-left">Name</th>
                                  <th className="border border-gray-200 px-2 sm:px-4 py-2 text-left">Qty</th>
                                  <th className="border border-gray-200 px-2 sm:px-4 py-2 text-left">Price (KWD)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {record.contents.map((item, index) => (
                                  <tr key={index}>
                                    <td className="border border-gray-200 px-2 sm:px-4 py-2 truncate max-w-[150px]">
                                      {item.name}
                                    </td>
                                    <td className="border border-gray-200 px-2 sm:px-4 py-2">{item.qty}</td>
                                    <td className="border border-gray-200 px-2 sm:px-4 py-2">{item.price.toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-gray-400 italic text-xs sm:text-sm">No contents specified</div>
                        )}
                      </div>
                    )}
                  </div>
                ) : group.title === "Business Invoice Information" && isEditing ? (
                  <div className="space-y-3 sm:space-y-4">
                    {group.fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700">
                          {field.label}
                        </label>
                        {formData[field.key].map((value, index) => (
                          <div key={index} className="flex gap-2 items-end">
                            <Input
                              type="text"
                              value={value}
                              onChange={(e) =>
                                handleChange(field.key, e.target.value, index)
                              }
                              placeholder={`Enter ${field.label} ${index + 1}`}
                              className="flex-1 text-xs sm:text-sm"
                            />
                            <Button
                              variant="outline"
                              className="text-red-600 hover:bg-red-50 p-2"
                              onClick={() => removeArrayItem(field.key, index)}
                            >
                              <Trash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => addArrayItem(field.key)}
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          <Plus className="h-4 w-4 mr-1.5 sm:mr-2" />
                          Add {field.label}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {group.fields.map((field) => (
                      <div
                        key={field.key}
                        className={field.type === "textarea" ? "sm:col-span-2" : ""}
                      >
                        {isEditing && field.type !== "array" ? (
                          field.type === "textarea" ? (
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                {field.label}
                              </label>
                              <textarea
                                value={formData[field.key] || ""}
                                onChange={(e) =>
                                  handleChange(field.key, e.target.value)
                                }
                                rows={3}
                                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y text-xs sm:text-sm"
                              />
                            </div>
                          ) : (
                            <Input
                              label={field.label}
                              type={field.type}
                              value={formData[field.key] || ""}
                              onChange={(e) =>
                                handleChange(field.key, e.target.value)
                              }
                              className="text-xs sm:text-sm"
                            />
                          )
                        ) : (
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5">
                              {field.label}
                            </label>
                            <div
                              className={`text-xs sm:text-sm text-gray-900 break-words ${!record[field.key] ? "text-gray-400 italic" : ""
                                }`}
                            >
                              {field.type === "array"
                                ? (record[field.key] || []).length > 0
                                  ? record[field.key].join(", ")
                                  : "Not specified"
                                : field.key === "shippingDate" && record[field.key]
                                  ? new Date(record[field.key]).toLocaleDateString()
                                  : record[field.key] || "Not specified"}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Image Modal */}
      {modalIsOpen && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black bg-opacity-75"
          onClick={() => {
            setModalIsOpen(false);
            setSelectedImage(null);
          }}
        >
          <div
            className="relative bg-white rounded-xl p-3 sm:p-4 max-w-full max-h-full overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setModalIsOpen(false);
                setSelectedImage(null);
              }}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-1 shadow-md"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <img
              src={selectedImage}
              alt="Full size image"
              className="max-w-full max-h-[75vh] sm:max-h-[80vh] object-contain block mx-auto"
              onError={(e) => {
                e.target.style.display = "none";
                console.error("Failed to load full-size image:", selectedImage);
                toast.error("Failed to load full-size image");
              }}
            />
            <div className="mt-3 sm:mt-4 flex justify-center">
              <Button
                onClick={() =>
                  handleDownloadImage(
                    selectedImage,
                    `scanned_image_${record.barcodeNumber || record.clientId}_${Date.now()}.jpg`
                  )
                }
                variant="default"
                size="sm"
              >
                <Download className="h-4 w-4 mr-1.5 sm:mr-2" />
                Download Image
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      {record && (
        <div className="print-only" style={{ display: "none" }}>
          <style>
            {`
              @media screen {
                .print-only { display: none !important; }
              }
              @media print {
                body * { visibility: hidden; }
                .print-only, .print-only * { visibility: visible; }
                .print-only { position: absolute; left: 0; top: 0; width: 100%; }
                .print-container { max-width: 800px; margin: 20px auto; padding: 20px; border: 1px solid #000; }
                .print-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                .print-header img { max-width: 150px; height: auto; }
                .print-header .header-text { text-align: right; }
                .print-header h1 { font-size: 24px; margin: 0; }
                .print-header p { font-size: 14px; color: #333; margin: 5px 0 0; }
                .print-section { margin-bottom: 20px; }
                .print-section h2 { font-size: 18px; margin-bottom: 10px; border-bottom: 1px solid #000; }
                .print-field { margin-bottom: 8px; font-size: 14px; }
                .print-field label { font-weight: bold; display: inline-block; width: 200px; vertical-align: top; }
                .print-field span { display: inline-block; max-width: 500px; }
                .print-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                .print-table th, .print-table td { border: 1px solid #000; padding: 8px; text-align: left; }
                .print-table th { background-color: #f0f0f0; font-weight: bold; }
                .print-totals { margin-top: 10px; font-size: 14px; font-weight: bold; }
                @page { margin: 1cm; }
              `}
          </style>
          <div className="print-container">
            <div className="print-header">
              <img src={logo} alt="Company Logo" />
              <div className="header-text">
                {record.barcodeNumber == "UNKNOWN" ? (
                  <h1 className="text-center">{record.invoiceType}</h1>
                ) : (
                  <h1>Barcode: {record.barcodeNumber}</h1>
                )}
                <p>Date: {new Date(record.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {fieldGroups.map((group) => (
              <div key={group.title} className="print-section">
                <h2>{group.title}</h2>
                {group.key === "contents" ? (
                  record.contents.length > 0 ? (
                    <>
                      <table className="print-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Quantity</th>
                            <th>Price (KWD)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {record.contents.map((item, index) => (
                            <tr key={index}>
                              <td>{item.name}</td>
                              <td>{item.qty}</td>
                              <td>{item.price.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="print-totals">
                        <p>Total Quantity: {record.contents.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)}</p>
                        <p>Total Price: {record.contents.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0).toFixed(2)} KWD</p>
                      </div>
                    </>
                  ) : (
                    <div className="print-field">
                      <label>Contents:</label>
                      <span>No contents specified</span>
                    </div>
                  )
                ) : (
                  group.fields.map((field) => (
                    <div key={field.key} className="print-field">
                      <label>{field.label}:</label>
                      <span>
                        {field.type === "array"
                          ? (record[field.key] || []).length > 0
                            ? record[field.key].join(", ")
                            : "Not specified"
                          : field.key === "shippingDate" && record[field.key]
                            ? new Date(record[field.key]).toLocaleDateString()
                            : record[field.key] || "Not specified"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default RecordView;