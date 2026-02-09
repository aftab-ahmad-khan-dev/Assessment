import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Eye,
  Edit3,
  Download,
  Calendar,
  Package,
  Trash2,
  Plus,
  MoreVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/UI/Button.jsx";
import Table from "../components/UI/Table.jsx";

const BaseUrl = import.meta.env.VITE_BASE_URL;

const ClientDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    if (!clientId) {
      toast.error("No client ID provided");
      navigate("/clients");
      return;
    }

    try {
      const response = await fetch(`${BaseUrl}/clients/get-client-data/${clientId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const clientResponse = await response.json();
      console.log("API Response:", clientResponse); // Debug: Log the full API response

      const foundClient = clientResponse.data;
      if (!foundClient) {
        toast.error("Client not found");
        navigate("/clients");
        return;
      }

      setClient(foundClient);
      const fetchedRecords = foundClient.records || [];
      console.log("Fetched Records:", fetchedRecords); // Debug: Log records being set
      setRecords(fetchedRecords);
    } catch (error) {
      toast.error("Failed to load client data");
      console.error("Error loading client:", error);
      navigate("/clients");
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: "barcodeNumber",
      title: "Barcode",
      sortable: true,
      render: (record) => (
        <div className="font-mono text-sm font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded-md inline-block">
          {record.tracking?.barcodeNumber || "N/A"}
        </div>
      ),
    },
    {
      key: "shippingDate",
      title: "Shipping Date",
      sortable: true,
      render: (record) => (
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-100 rounded-md">
            <Calendar className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span className="text-gray-700 font-medium">
            {record.additional?.shippingDate
              ? new Date(record.additional.shippingDate).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
      ),
    },
    {
      key: "totalWeight",
      title: "Weight",
      sortable: true,
      render: (record) => (
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-green-100 rounded-md">
            <Package className="h-3.5 w-3.5 text-green-600" />
          </div>
          <span className="text-gray-700 font-medium">
            {record.additional?.totalWeight
              ? `${record.additional.totalWeight} kg`
              : "N/A"}
          </span>
        </div>
      ),
    },
    {
      key: "totalPieces",
      title: "Pieces",
      sortable: true,
      render: (record) => (
        <span className="font-semibold text-gray-900 bg-slate-100 px-2.5 py-1 rounded-full text-sm">
          {record.additional?.totalPieces || "N/A"}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (record) => (
        <div className="flex items-center justify-end">
          <div className="hidden sm:flex items-center space-x-1">
            <Link to={`/records/${record._id}`}>
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-blue-50 hover:border-blue-200"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={`/records/${record._id}/edit`}>
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-amber-50 hover:border-amber-200"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              className="hover:bg-green-50 hover:border-green-200"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:bg-red-50 hover:border-red-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="sm:hidden">
            <Button size="sm" variant="outline">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div> */}
          <p className="text-gray-500 font-medium">Loading client data...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Client Not Found
          </h3>
          <p className="text-gray-500 mb-6">
            The requested client could not be found.
          </p>
          <Link to="/clients">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Link to="/clients">
            <Button variant="outline" size="sm" className="hover:bg-gray-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Clients</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
          <Link to="/scan">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add New Record</span>
              <span className="sm:hidden">Add Record</span>
            </Button>
          </Link>
        </div>

        {/* Client Info */}
        {client && (
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg">
              {client.name
                ? client.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
                : "--"}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">
                {client.name || "Unknown Client"}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">
                    {client.recordsCount || records.length} shipping records
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Created{" "}
                    {client.createdAt
                      ? new Date(client.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Records Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        {console.log("Records in render:", records)} {/* Debug: Log records in render */}
        {records.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No shipping records yet
              </h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                This client doesn't have any shipping records yet. Get started by
                adding their first record.
              </p>
              <Link to="/scan">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md">
                  <Plus className="h-5 w-5 mr-2" />
                  Add First Record
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="hidden sm:block">
              <Table
                data={records}
                columns={columns}
                className="border-0 shadow-none"
              />
            </div>
            <div className="sm:hidden divide-y divide-gray-100">
              {records.map((record, index) => (
                <motion.div
                  key={record._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-mono text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                      {record.tracking?.barcodeNumber || "N/A"}
                    </div>
                    <Button size="sm" variant="outline">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-blue-100 rounded">
                        <Calendar className="h-3 w-3 text-blue-600" />
                      </div>
                      <span className="text-gray-600 truncate">
                        {record.additional?.shippingDate
                          ? new Date(record.additional.shippingDate).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-green-100 rounded">
                        <Package className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-gray-600">
                        {record.additional?.totalWeight
                          ? `${record.additional.totalWeight} kg`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">
                      {record.additional?.totalPieces || "N/A"} pieces
                    </span>
                    <Link to={`/records/${record._id}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ClientDetail;





// TODO Delete below code once above is verified from the respective developer
// import React, { useState, useEffect } from "react";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   ArrowLeft,
//   FileText,
//   Eye,
//   Edit3,
//   Download,
//   Calendar,
//   Package,
//   Trash2,
//   Plus,
//   MoreVertical,
// } from "lucide-react";
// import toast from "react-hot-toast";
// import { useApi } from "../context/ApiContext.jsx";
// import Button from "../components/UI/Button.jsx";
// import Table from "../components/UI/Table.jsx";

// const ClientDetail = () => {
//   const { clientId } = useParams();
//   const navigate = useNavigate();
//   const { getClient, getRecords } = useApi(); // Assuming getClient is available
//   const [client, setClient] = useState(null);
//   const [records, setRecords] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     loadClientData();
//   }, [clientId]);

//   const loadClientData = async () => {
//     if (!clientId) {
//       toast.error("No client ID provided");
//       navigate("/clients");
//       return;
//     }

//     try {
//       // Fetch the specific client via API
//       const clientResponse = await getClient({ id: clientId });
//       const foundClient = clientResponse.data;
//       if (!foundClient) {
//         toast.error("Client not found");
//         navigate("/clients");
//         return;
//       }

//       setClient(foundClient);

//       // Fetch all records and filter for this client
//       const recordsResponse = await getRecords();
//       const clientRecords = (recordsResponse.data || []).filter(
//         (r) => r.clientId?._id?.toString() === clientId
//       );
//       setRecords(clientRecords);
//     } catch (error) {
//       toast.success("Client Data not found");
//       // toast.error("Failed to load client data");
//       console.error("Error loading client:", error);
//       navigate("/clients");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const columns = [
//     {
//       key: "barcodeNumber",
//       title: "Barcode",
//       sortable: true,
//       render: (record) => (
//         <div className="font-mono text-sm font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded-md inline-block">
//           {record.barcodeNumber}
//         </div>
//       ),
//     },
//     {
//       key: "shippingDate",
//       title: "Shipping Date",
//       sortable: true,
//       render: (record) => (
//         <div className="flex items-center space-x-2">
//           <div className="p-1.5 bg-blue-100 rounded-md">
//             <Calendar className="h-3.5 w-3.5 text-blue-600" />
//           </div>
//           <span className="text-gray-700 font-medium">
//             {new Date(record.shippingDate).toLocaleDateString()}
//           </span>
//         </div>
//       ),
//     },
//     {
//       key: "totalWeight",
//       title: "Weight",
//       sortable: true,
//       render: (record) => (
//         <div className="flex items-center space-x-2">
//           <div className="p-1.5 bg-green-100 rounded-md">
//             <Package className="h-3.5 w-3.5 text-green-600" />
//           </div>
//           <span className="text-gray-700 font-medium">{record.totalWeight} kg</span>
//         </div>
//       ),
//     },
//     {
//       key: "totalPieces",
//       title: "Pieces",
//       sortable: true,
//       render: (record) => (
//         <span className="font-semibold text-gray-900 bg-slate-100 px-2.5 py-1 rounded-full text-sm">
//           {record.totalPieces}
//         </span>
//       ),
//     },
//     {
//       key: "actions",
//       title: "Actions",
//       render: (record) => (
//         <div className="flex items-center justify-end">
//           {/* Desktop Actions */}
//           <div className="hidden sm:flex items-center space-x-1">
//             <Link to={`/records/${record.id}`}>
//               <Button
//                 size="sm"
//                 variant="outline"
//                 className="hover:bg-blue-50 hover:border-blue-200"
//               >
//                 <Eye className="h-4 w-4" />
//               </Button>
//             </Link>
//             <Link to={`/records/${record.id}/edit`}>
//               <Button
//                 size="sm"
//                 variant="outline"
//                 className="hover:bg-amber-50 hover:border-amber-200"
//               >
//                 <Edit3 className="h-4 w-4" />
//               </Button>
//             </Link>
//             <Button
//               size="sm"
//               variant="outline"
//               className="hover:bg-green-50 hover:border-green-200"
//             >
//               <Download className="h-4 w-4" />
//             </Button>
//             <Button
//               size="sm"
//               variant="outline"
//               className="text-red-600 hover:bg-red-50 hover:border-red-200"
//             >
//               <Trash2 className="h-4 w-4" />
//             </Button>
//           </div>

//           {/* Mobile Menu Button */}
//           <div className="sm:hidden">
//             <Button size="sm" variant="outline">
//               <MoreVertical className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       ),
//     },
//   ];

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-500 font-medium">Loading client data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!client) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="text-center py-16"
//       >
//         <div className="max-w-md mx-auto">
//           <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <FileText className="h-8 w-8 text-gray-400" />
//           </div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">
//             Client Not Found
//           </h3>
//           <p className="text-gray-500 mb-6">
//             The requested client could not be found.
//           </p>
//           <Link to="/clients">
//             <Button>
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back to Clients
//             </Button>
//           </Link>
//         </div>
//       </motion.div>
//     );
//   }

//   return (
//     <div className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
//       {/* Header */}
//       <motion.div
//         initial={{ y: -20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm"
//       >
//         {/* Navigation and Actions Row */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//           <Link to="/clients">
//             <Button variant="outline" size="sm" className="hover:bg-gray-50">
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               <span className="hidden sm:inline">Back to Clients</span>
//               <span className="sm:hidden">Back</span>
//             </Button>
//           </Link>
//           <Link to="/scan">
//             <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md">
//               <Plus className="h-4 w-4 mr-2" />
//               <span className="hidden sm:inline">Add New Record</span>
//               <span className="sm:hidden">Add Record</span>
//             </Button>
//           </Link>
//         </div>

//         {/* Client Info */}
//         <div className="flex flex-col sm:flex-row sm:items-start gap-4">
//           {/* Avatar */}
//           <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg">
//             {client.name
//               .split(" ")
//               .map((n) => n[0])
//               .join("")
//               .toUpperCase()
//               .slice(0, 2)}
//           </div>

//           {/* Details */}
//           <div className="flex-1 min-w-0">
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">
//               {client.name}
//             </h1>
//             <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                 <span className="font-medium">
//                   {records.length} shipping records
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Calendar className="h-4 w-4" />
//                 <span>
//                   Created {new Date(client.createdAt).toLocaleDateString()}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </motion.div>

//       {/* Records Section */}
//       <motion.div
//         initial={{ y: 20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ delay: 0.1 }}
//         className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
//       >
//         {records.length === 0 ? (
//           <div className="p-8 sm:p-12 text-center">
//             <div className="max-w-md mx-auto">
//               <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
//                 <FileText className="h-10 w-10 text-gray-400" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-3">
//                 No shipping records yet
//               </h3>
//               <p className="text-gray-500 mb-8 leading-relaxed">
//                 This client doesn't have any shipping records yet. Get started by
//                 adding their first record.
//               </p>
//               <Link to="/scan">
//                 <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md">
//                   <Plus className="h-5 w-5 mr-2" />
//                   Add First Record
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         ) : (
//           <div className="overflow-hidden">
//             {/* Table Header - Hidden on mobile, shown as cards instead */}
//             <div className="hidden sm:block">
//               <Table
//                 data={records}
//                 columns={columns}
//                 className="border-0 shadow-none"
//               />
//             </div>

//             {/* Mobile Cards */}
//             <div className="sm:hidden divide-y divide-gray-100">
//               {records.map((record, index) => (
//                 <motion.div
//                   key={record.id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.1 }}
//                   className="p-4 hover:bg-gray-50 transition-colors"
//                 >
//                   <div className="flex justify-between items-start mb-3">
//                     <div className="font-mono text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
//                       {record.barcodeNumber}
//                     </div>
//                     <Button size="sm" variant="outline">
//                       <MoreVertical className="h-4 w-4" />
//                     </Button>
//                   </div>

//                   <div className="grid grid-cols-2 gap-3 text-sm">
//                     <div className="flex items-center gap-2">
//                       <div className="p-1 bg-blue-100 rounded">
//                         <Calendar className="h-3 w-3 text-blue-600" />
//                       </div>
//                       <span className="text-gray-600 truncate">
//                         {new Date(record.shippingDate).toLocaleDateString()}
//                       </span>
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <div className="p-1 bg-green-100 rounded">
//                         <Package className="h-3 w-3 text-green-600" />
//                       </div>
//                       <span className="text-gray-600">{record.totalWeight} kg</span>
//                     </div>
//                   </div>

//                   <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
//                     <span className="text-xs font-medium text-gray-500">
//                       {record.totalPieces} pieces
//                     </span>
//                     <Link to={`/records/${record.id}`}>
//                       <Button size="sm" variant="outline" className="text-xs">
//                         <Eye className="h-3 w-3 mr-1" />
//                         View
//                       </Button>
//                     </Link>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         )}
//       </motion.div>
//     </div>
//   );
// };

// export default ClientDetail;
