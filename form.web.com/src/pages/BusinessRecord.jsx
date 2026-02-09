import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Package,
  FileText,
  ScanLine,
  MoreVertical,
  BarChart3,
  RefreshCw,
  X,
  Zap,
  Bus,
} from "lucide-react";
import { useApi } from "../context/ApiContext.jsx";
import Button from "../components/UI/Button.jsx";
import Table from "../components/UI/Table.jsx";
import SearchBar from "../components/UI/SearchBar.jsx";
import useDebounce from "../hooks/useDebounce.js";
import { exportToCSV } from "../utils/export.js";
import toast from "react-hot-toast";

const BusinessRecord = () => {
  const { getRecords, getClients } = useApi();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    clientId: "",
    dateFrom: "",
    dateTo: "",
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, debouncedSearchTerm, filters]);

  const loadData = async () => {
    try {
      const [recordsResponse, clientsResponse] = await Promise.all([
        getRecords({ invoiceType: "business-invoice" }),
        getClients(),
      ]);
      const records = recordsResponse.data || [];

      // Data validation
      records.forEach((record) => {
        const calculatedQty = record.contents
          ? record.contents.reduce((sum, item) => sum + (item.qty || 0), 0)
          : 0;
        if (record.quantity !== calculatedQty) {
          console.warn(
            `Quantity mismatch for record ${record.id}: record.quantity=${record.quantity}, contents.qty sum=${calculatedQty}`
          );
        }
        if (record.pieces && record.pieces !== record.totalPieces) {
          console.warn(
            `Pieces mismatch for record ${record.id}: record.pieces=${record.pieces}, record.totalPieces=${record.totalPieces}`
          );
        }
      });

      setRecords(records);
      setClients(
        clientsResponse.data.map((client) => ({
          ...client,
          id: client._id,
        })) || []
      );
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error(`No Data Found: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...records];

    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          (record.barcodeNumber?.toLowerCase() || "").includes(term) ||
          (record.clientName?.toLowerCase() || "").includes(term) ||
          (record.senderName?.toLowerCase() || "").includes(term) ||
          (record.recipientName?.toLowerCase() || "").includes(term)
      );
    }

    if (filters.clientId) {
      filtered = filtered.filter((record) => record.clientId === filters.clientId);
    }

    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      if (!isNaN(dateFrom)) {
        filtered = filtered.filter((record) => {
          const shippingDate = new Date(record.shippingDate);
          return !isNaN(shippingDate) && shippingDate >= dateFrom;
        });
      }
    }

    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      if (!isNaN(dateTo)) {
        dateTo.setHours(23, 59, 59, 999);
        filtered = filtered.filter((record) => {
          const shippingDate = new Date(record.shippingDate);
          return !isNaN(shippingDate) && shippingDate <= dateTo;
        });
      }
    }

    setFilteredRecords(filtered);
  };

  const handleExportCSV = () => {
    exportToCSV(filteredRecords, "business-shipping-records.csv");
    toast.success("CSV exported successfully!");
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      clientId: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const hasActiveFilters = searchTerm || Object.values(filters).some((f) => f);

  const totalWeight = filteredRecords.reduce(
    (sum, record) => sum + (record.totalWeight || 0),
    0
  );
  const totalPieces = filteredRecords.reduce(
    (sum, record) => sum + (record.totalPieces || 0),
    0
  );
  const totalQuantity = filteredRecords.reduce(
    (sum, record) => sum + (record.quantity || 0),
    0
  );
  const totalPrice = filteredRecords.reduce(
    (sum, record) => sum + (record.price || 0),
    0
  );

  const columns = [
    {
      key: "shippingDate",
      title: "Date",
      sortable: true,
      render: (record) => (
        <div className='flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700'>
          <Calendar className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600' />
          {record.shippingDate
            ? new Date(record.shippingDate).toLocaleDateString()
            : "N/A"}
        </div>
      ),
    },
    {
      key: "invoiceType",
      title: "Type",
      sortable: true,
      render: () => (
        <span className='text-xs sm:text-sm font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg'>
          Business
        </span>
      ),
    },
    {
      key: "totalPrice",
      title: "Price",
      sortable: true,
      render: (record) => (
        <div className='flex items-center gap-2'>
          <div className='p-1.5 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg shadow-sm'>
            <span className='text-xs font-bold text-emerald-700'>KWD</span>
          </div>
          <span className='font-bold text-emerald-900 text-sm sm:text-base'>
            {record.price?.toFixed(2) || "0.00"}
          </span>
        </div>
      ),
    },
    {
      key: "quantity",
      title: "Qty",
      sortable: true,
      render: (record) => (
        <span className='font-bold text-xs sm:text-sm text-gray-900 bg-gradient-to-r from-blue-100 to-blue-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-sm border border-blue-200'>
          {record.quantity || 0}
        </span>
      ),
    },
    {
      key: "totalPieces",
      title: "Pieces",
      sortable: true,
      render: (record) => (
        <span className='font-bold text-xs sm:text-sm text-gray-900 bg-gradient-to-r from-slate-100 to-slate-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-sm border border-slate-200'>
          {record.totalPieces || 0}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (record) => (
        <div className='flex items-center gap-1 sm:gap-2'>
          <Link to={`/records/${record.id}`}>
            <Button
              size='sm'
              variant='outline'
              className='hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-1.5 sm:p-2'
            >
              <Eye className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen px-4'>
        <div className='text-center'>
          <div className='relative h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6'>
            <div className='outer-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200'></div>
            <div className='inner-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-blue-600 absolute top-0 left-0'></div>
          </div>
          <p className='text-gray-600 font-semibold text-base sm:text-lg'>
            Loading business records...
          </p>
          <p className='text-gray-400 text-xs sm:text-sm mt-1'>Please wait a moment</p>
        </div>
        <style jsx>{`
          @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes spin-fast { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
          .outer-spin { animation: spin-slow 2s linear infinite; }
          .inner-spin { animation: spin-fast 1s linear infinite; }
        `}</style>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
      <div className='space-y-6 sm:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-6 sm:py-8'>
        {/* Header Card */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className='bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl ring-1 ring-gray-900/5'
        >
          <div className='flex flex-col gap-4 sm:gap-6'>
            {/* Title + Actions */}
            <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
              <div className='flex items-center gap-2 sm:gap-3'>
                <div className='p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg'>
                  <Bus className='h-6 w-6 sm:h-8 sm:w-8 text-white' />
                </div>
                <div>
                  <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent'>
                    Business Invoice Records
                  </h1>
                  <p className='text-xs sm:text-sm text-gray-600 mt-0.5'>
                    Manage and track all business shipments
                  </p>
                </div>
              </div>

              <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
                <Button
                  variant='outline'
                  onClick={handleExportCSV}
                  disabled={filteredRecords.length === 0}
                  className='w-full sm:w-auto text-xs sm:text-sm hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50 border-emerald-200 text-emerald-700'
                >
                  <Download className='h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2' />
                  <span className='hidden xs:inline'>Export CSV</span>
                  <span className='xs:hidden'>CSV</span>
                </Button>
                <Link to='/scan' className='w-full sm:w-auto'>
                  <Button className='w-full bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 shadow-sm hover:shadow-md text-xs sm:text-sm'>
                    <ScanLine className='h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2' />
                    <Zap className='h-3 w-3 sm:h-4 sm:w-4 mr-1 opacity-75' />
                    <span className='hidden xs:inline'>New Scan</span>
                    <span className='xs:hidden'>Scan</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div className='grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4'>
              <div className='bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-xl border border-blue-200/50 shadow-sm'>
                <div className='flex items-center gap-2 sm:gap-3'>
                  <div className='p-1.5 sm:p-2 bg-blue-500 rounded-lg shadow-sm'>
                    <FileText className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-white' />
                  </div>
                  <div>
                    <p className='text-lg sm:text-2xl font-bold text-blue-900'>
                      {filteredRecords.length}
                    </p>
                    <p className='text-xs sm:text-sm text-blue-700'>
                      {filteredRecords.length !== records.length ? `of ${records.length}` : ""} Records
                    </p>
                  </div>
                </div>
              </div>
              <div className='bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 sm:p-4 rounded-xl border border-emerald-200/50 shadow-sm'>
                <div className='flex items-center gap-2 sm:gap-3'>
                  <div className='p-1.5 sm:p-2 bg-emerald-500 rounded-lg shadow-sm'>
                    <Package className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-white' />
                  </div>
                  <div>
                    <p className='text-lg sm:text-2xl font-bold text-emerald-900'>
                      {totalQuantity}
                    </p>
                    <p className='text-xs sm:text-sm text-emerald-700'>Total Qty</p>
                  </div>
                </div>
              </div>
              <div className='bg-gradient-to-br from-amber-50 to-amber-100 p-3 sm:p-4 rounded-xl border border-amber-200/50 shadow-sm'>
                <div className='flex items-center gap-2 sm:gap-3'>
                  <div className='p-1.5 sm:p-2 bg-amber-500 rounded-lg shadow-sm'>
                    <BarChart3 className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-white' />
                  </div>
                  <div>
                    <p className='text-lg sm:text-2xl font-bold text-amber-900'>
                      {totalPieces}
                    </p>
                    <p className='text-xs sm:text-sm text-amber-700'>Total Pieces</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters Badge */}
            {hasActiveFilters && (
              <div className='flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-lg sm:rounded-xl text-xs sm:text-sm'>
                <div className='w-2 h-2 bg-amber-500 rounded-full animate-pulse'></div>
                <span className='text-amber-800 font-semibold'>Active filters applied</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className='bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 p-4 sm:p-6 ring-1 ring-gray-900/5'
        >
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-2'>
              <div className='p-1.5 sm:p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg sm:rounded-xl'>
                <Filter className='h-4 w-4 sm:h-5 sm:w-5 text-gray-600' />
              </div>
              <h3 className='text-base sm:text-lg lg:text-xl font-bold text-gray-900'>Search & Filter</h3>
            </div>
            {hasActiveFilters && (
              <Button
                variant='outline'
                size='sm'
                onClick={clearFilters}
                className='text-xs sm:text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200'
              >
                <X className='h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1' />
                Clear
              </Button>
            )}
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
            <div className='space-y-1.5'>
              <label className='text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5'>
                <Search className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400' />
                Search
              </label>
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder='Client, sender...'
                className='text-xs sm:text-sm'
              />
            </div>
            <div className='space-y-1.5'>
              <label className='text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5'>
                <Calendar className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400' />
                From
              </label>
              <input
                type='date'
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className='w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm'
              />
            </div>
            <div className='space-y-1.5'>
              <label className='text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5'>
                <Calendar className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400' />
                To
              </label>
              <input
                type='date'
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className='w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm'
              />
            </div>
          </div>
        </motion.div>

        {/* Records */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className='bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden ring-1 ring-gray-900/5'
        >
          {filteredRecords.length === 0 ? (
            <div className='p-8 sm:p-12 lg:p-16 text-center'>
              <div className='max-w-md mx-auto'>
                <div className='w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 via-blue-100 to-purple-100 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg'>
                  {hasActiveFilters ? (
                    <Search className='h-10 w-10 sm:h-12 sm:w-12 text-gray-400' />
                  ) : (
                    <Bus className='h-10 w-10 sm:h-12 sm:w-12 text-gray-400' />
                  )}
                </div>
                <h3 className='text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3'>
                  {hasActiveFilters ? "No matching records" : "No business records yet"}
                </h3>
                <p className='text-gray-600 text-xs sm:text-sm lg:text-base mb-6 sm:mb-8 leading-relaxed'>
                  {hasActiveFilters
                    ? "Try adjusting your filters or clear them to see all records."
                    : "Scan your first business invoice to get started."}
                </p>
                <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                  {hasActiveFilters ? (
                    <Button
                      variant='outline'
                      onClick={clearFilters}
                      className='text-xs sm:text-sm hover:bg-blue-50 hover:border-blue-300 border-2'
                    >
                      <RefreshCw className='h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5' />
                      Clear Filters
                    </Button>
                  ) : (
                    <Link to='/scan'>
                      <Button className='bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 shadow-lg hover:shadow-xl text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3'>
                        <ScanLine className='h-4 w-4 sm:h-5 sm:w-5 mr-2' />
                        <Zap className='h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 opacity-75' />
                        Start Scanning
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className='hidden lg:block overflow-x-auto'>
                <Table data={filteredRecords} columns={columns} className='border-0 shadow-none' />
              </div>

              {/* Mobile & Tablet Cards */}
              <div className='lg:hidden divide-y divide-gray-100'>
                {filteredRecords.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className='p-4 sm:p-6 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300'
                  >
                    <div className='flex justify-between items-start mb-3'>
                      <div className='font-mono text-sm sm:text-base font-bold text-gray-900 bg-gradient-to-r from-gray-100 to-gray-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm'>
                        {record.barcodeNumber || "N/A"}
                      </div>
                      <Link to={`/records/${record.id}`}>
                        <Button size='sm' variant='outline' className='p-1.5 sm:p-2'>
                          <Eye className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                        </Button>
                      </Link>
                    </div>

                    <div className='grid grid-cols-2 gap-3 text-xs sm:text-sm mb-3'>
                      <div className='flex items-center gap-2 bg-blue-50 p-2 sm:p-3 rounded-lg sm:rounded-xl'>
                        <div className='p-1.5 bg-blue-500 rounded-lg shadow-sm'>
                          <Calendar className='h-3 w-3 sm:h-3.5 sm:w-3.5 text-white' />
                        </div>
                        <div>
                          <span className='text-gray-900 font-semibold block'>
                            {record.shippingDate
                              ? new Date(record.shippingDate).toLocaleDateString()
                              : "N/A"}
                          </span>
                          <span className='text-blue-600'>Shipped</span>
                        </div>
                      </div>
                      <div className='flex items-center gap-2 bg-emerald-50 p-2 sm:p-3 rounded-lg sm:rounded-xl'>
                        <div className='p-1.5 bg-emerald-500 rounded-lg shadow-sm'>
                          <span className='text-xs font-bold text-white'>KWD</span>
                        </div>
                        <div>
                          <span className='text-gray-900 font-semibold block'>
                            {record.price?.toFixed(2) || "0.00"}
                          </span>
                          <span className='text-emerald-600'>Price</span>
                        </div>
                      </div>
                    </div>

                    <div className='flex justify-between items-center pt-3 border-t border-gray-100'>
                      <div className='flex gap-2'>
                        <div className='px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full'>
                          <span className='text-xs sm:text-sm font-bold text-blue-700'>
                            {record.quantity || 0} qty
                          </span>
                        </div>
                        <div className='px-3 py-1.5 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full'>
                          <span className='text-xs sm:text-sm font-bold text-gray-700'>
                            {record.totalPieces || 0} pcs
                          </span>
                        </div>
                      </div>
                      <Link to={`/records/${record.id}`}>
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-xs sm:text-sm hover:bg-blue-50 hover:border-blue-300'
                        >
                          <Eye className='h-3.5 w-3.5 mr-1.5' />
                          View
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BusinessRecord;