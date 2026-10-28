import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ScanLine,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Package,
  Activity,
  ArrowUpRight,
  Zap,
  Eye,
  BarChart3,
  Clock,
} from "lucide-react";
import { useApi } from "../context/ApiContext.jsx";
import Button from "../components/UI/Button.jsx";

const Dashboard = () => {
  const { getClients, getRecords } = useApi();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalRecords: 0,
    todayRecords: 0,
    weekRecords: 0,
  });
  const [recentRecords, setRecentRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [clientsResponse, recordsResponse] = await Promise.all([
        getClients(),
        getRecords(),
      ]);

      const clients = clientsResponse.data || [];
      const records = recordsResponse.data || [];

      const today = new Date().toISOString().split("T")[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      setStats({
        totalClients: clients.length,
        totalRecords: records.length,
        todayRecords: records.filter((r) => r.createdAt.split("T")[0] === today)
          .length,
        weekRecords: records.filter((r) => r.createdAt.split("T")[0] >= weekAgo)
          .length,
        individualRecords: records.filter(
          (r) => r.invoiceType === "individual-invoice"
        ).length,
        businessRecords: records.filter(
          (r) => r.invoiceType === "business-invoice"
        ).length,
      });

      setRecentRecords(records.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: "New Scan",
      description: "Capture and process a new shipping sticker",
      icon: ScanLine,
      to: "/scan",
      color: "from-blue-600 to-blue-700",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "User Records",
      description: "Browse and search all User records",
      icon: FileText,
      to: "/records",
      color: "from-purple-600 to-purple-700",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      title: "Manage Businesses Invoices",
      description: "View and organize your businesses invoices",
      icon: Users,
      to: "/business-records",
      color: "from-emerald-600 to-emerald-700",
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
  ];

  const statCards = [
    {
      title: "Business Invoices",
      value: stats.businessRecords,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Individual Invoices",
      value: stats.individualRecords,
      icon: Package,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Today",
      value: stats.todayRecords,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      gradient: "from-orange-500 to-orange-600",
    },
    {
      title: "This Week",
      value: stats.weekRecords,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      gradient: "from-purple-500 to-purple-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="relative h-20 w-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent"
            ></motion.div>
          </div>
          <p className="text-slate-600 font-semibold text-lg">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">
      <div className="max-w-[1500px] mx-auto py-8 lg:py-12 space-y-8 lg:space-y-10">

        {/* ✅ Welcome Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center px-2"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold mb-4 sm:mb-5 shadow-sm border border-blue-200"
          >
            <Zap className="h-4 w-4 mr-2" />
            OCR Powered Dashboard
          </motion.div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl 2xl:text-6xl font-bold text-slate-900 mb-3 sm:mb-4 tracking-tight">
            Al-Shiraa Logistics
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-2">
            Efficiently capture, process, and manage shipping sticker data with
            intelligent OCR technology.
          </p>
        </motion.div>

        {/* ✅ Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 px-3 sm:px-4 md:px-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative w-full"
            >
              <div
                className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-300`}
              ></div>

              <div
                className={`relative bg-white rounded-2xl shadow-md border ${stat.borderColor} 
        p-5 md:p-6 transition-all duration-300 group-hover:shadow-xl`}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`p-3 sm:p-4 rounded-xl ${stat.bgColor} shadow-sm`}
                  >
                    <stat.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${stat.color}`} />
                  </motion.div>
                  <TrendingUp className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color} opacity-60`} />
                </div>

                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    {stat.title}
                  </p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 break-words">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>


        {/* ✅ Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group h-full"
            >
              <Link
                to={action.to}
                className={`flex flex-col justify-between h-full bg-white rounded-2xl shadow-md border ${action.borderColor} p-6 sm:p-7 lg:p-8 transition-all duration-300 hover:shadow-lg`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-4 rounded-xl ${action.bgColor} shadow border ${action.borderColor}`}
                    >
                      <action.icon
                        className={`h-7 w-7 sm:h-8 sm:w-8 ${action.iconColor}`}
                      />
                    </div>
                    <ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 group-hover:text-slate-700 transition" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-5 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-slate-600 mt-2 text-sm sm:text-base leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ✅ Recent Records */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
        >
          <div className="px-4 sm:px-6 py-5 sm:py-6 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2.5 sm:p-3 bg-blue-100 rounded-xl border border-blue-200">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold text-slate-900">
                    Recent Activity
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Latest shipping records
                  </p>
                </div>
              </div>

              <Link
                to="/records"
                className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base transition-all shadow hover:shadow-lg"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View All
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {recentRecords.length === 0 ? (
              <div className="text-center py-14 sm:py-20">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-20 sm:w-24 h-20 sm:h-24 mb-6 bg-blue-100 rounded-2xl border-2 border-blue-200"
                >
                  <Activity className="h-10 sm:h-12 w-10 sm:w-12 text-blue-600" />
                </motion.div>
                <h4 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">
                  No records yet
                </h4>
                <p className="text-slate-600 text-sm sm:text-lg mb-6 sm:mb-10 max-w-md mx-auto leading-relaxed">
                  Start by scanning your first shipping sticker to see your data here!
                </p>
                <Link to="/scan">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold shadow hover:shadow-xl text-sm sm:text-lg">
                    <ScanLine className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                    Start Scanning
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {recentRecords.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ x: 6, scale: 1.01 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-transparent rounded-xl hover:from-blue-50 hover:shadow-md border border-slate-100 hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div className="p-2.5 sm:p-3 bg-blue-100 rounded-xl border border-blue-200">
                        <Package className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold sm:font-bold text-slate-900 truncate text-sm sm:text-lg mb-1">
                          {record.barcodeNumber || "No Barcode for business invoice"}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 truncate flex items-center">
                          <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />
                          {record.recipientName || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end mt-3 sm:mt-0 space-x-3 sm:space-x-4 flex-shrink-0 ml-0 sm:ml-4">
                      <div className="hidden sm:block text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center justify-end mb-1">
                          <Clock className="h-4 w-4 mr-1.5 text-blue-600" />
                          {record.shippingDate.split("T")[0]}
                        </p>
                        <p className="text-xs text-slate-600 flex items-center justify-end">
                          <Package className="h-3 w-3 mr-1" />
                          {record.totalPieces} pieces
                        </p>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-blue-100 transition"
                      >
                        <Link to={`/records/${record.id}`}>
                          <Eye className="h-5 w-5 text-slate-600" />
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
