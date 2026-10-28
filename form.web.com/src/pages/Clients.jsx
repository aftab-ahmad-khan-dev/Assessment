import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Users,
  Eye,
  Edit3,
  Trash2,
  FileText,
  UserPlus,
  Calendar,
  TrendingUp,
  Grid,
  List,
  Building2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useApi } from "../context/ApiContext.jsx";
import Button from "../components/UI/Button.jsx";
import Input from "../components/UI/Input.jsx";
import Modal from "../components/UI/Modal.jsx";
import Table from "../components/UI/Table.jsx";
import useDebounce from "../hooks/useDebounce.js";

const Clients = () => {
  const { getClients, createClient, updateClient, deleteClient } = useApi();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState("table");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, debouncedSearchTerm]);

  const loadClients = async () => {
    try {
      const response = await getClients();
      setClients(response.data || []);
    } catch (error) {
      toast.success("Clients not found");
      // toast.error("Failed to load clients");
      console.error("Error loading clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterClients = () => {
    if (!debouncedSearchTerm) {
      setFilteredClients(clients);
      return;
    }

    const filtered = clients.filter((client) =>
      client.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  const handleAddClient = async () => {
    if (!newClientName.trim()) {
      toast.error("Client name is required");
      return;
    }

    setIsCreating(true);
    try {
      const response = await createClient({ name: newClientName.trim() });
      setClients((prev) => [...prev, response.data]);
      setNewClientName("");
      setShowAddModal(false);
      toast.success("Client added successfully!");
    } catch (error) {
      toast.error("Failed to add client");
      console.error("Error creating client:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!deletingClient) return;

    setIsDeleting(true);
    try {
      await deleteClient(deletingClient._id);
      setClients((prev) => prev.filter((c) => c.id !== deletingClient.id));
      setDeletingClient(null);
      setShowDeleteModal(false);
      toast.success("Client deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete client");
      console.error("Error deleting client:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (client) => {
    if (!client || !client._id) {
      // Use _id instead of id
      toast.error("Invalid client data. Please refresh.");
      console.error("Edit modal opened with invalid client:", client);
      return;
    }
    setEditingClient(client);
    setNewClientName(client.name);
    setShowEditModal(true);
  };

  const handleEditClient = async () => {
    if (!editingClient || !editingClient._id || !newClientName.trim()) {
      // Use _id
      if (!editingClient?._id) {
        toast.error("Invalid client ID. Please refresh the page.");
        console.error("Edit failed: Missing client ID", editingClient);
        return;
      }
      if (!newClientName.trim()) {
        toast.error("Client name is required");
        return;
      }
    }

    setIsUpdating(true);
    try {
      console.log("Updating client:", {
        id: editingClient._id,
        name: newClientName.trim(),
      });
      const response = await updateClient(editingClient._id, {
        name: newClientName.trim(),
      }); // Use _id
      setClients(
        (prev) => prev.map((c) => (c._id === editingClient._id ? response.data : c)) // Use _id
      );
      setNewClientName("");
      setEditingClient(null);
      setShowEditModal(false);
      toast.success("Client updated successfully!");
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error(`Failed to update client: ${error.message || "Unknown error"}`);
    } finally {
      setIsUpdating(false);
    }
  };
  const openDeleteModal = (client) => {
    console.log("Deleting client:", client);
    setDeletingClient({ ...client });
    setShowDeleteModal(true);
  };

  const columns = [
    {
      key: "name",
      title: "Client Information",
      sortable: true,
      render: (client) => (
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm sm:text-base">
              {client.name}
            </div>
            <div className="text-xs sm:text-sm text-slate-500 flex items-center mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              Created: {new Date(client.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "recordsCount",
      title: "Records",
      sortable: true,
      render: (client) => (
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg">
            <FileText className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="font-semibold text-slate-900">{client.recordsCount}</span>
        </div>
      ),
    },
    {
      key: "updatedAt",
      title: "Last Activity",
      sortable: true,
      render: (client) => (
        <div className="text-sm text-slate-600">
          {new Date(client.updatedAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (client) => (
        <div className="flex items-center space-x-2">
          <Link to={`/clients/${client._id}`}>
            {" "}
            <Button
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            size="sm"
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 border-0 shadow-sm hover:shadow-md transition-all duration-200"
            disabled={client.recordsCount > 0}
            onClick={() => openEditModal(client)}
            title={
              client.recordsCount > 0
                ? "Delete records first to edit"
                : "Edit client"
            }
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            className="bg-red-50 hover:bg-red-100 text-red-600 border-0 shadow-sm hover:shadow-md transition-all duration-200"
            disabled={client.recordsCount > 0}
            onClick={() => openDeleteModal(client)}
            title={
              client.recordsCount > 0 ? "Delete records first" : "Delete client"
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const ClientCard = ({ client, index, openEditModal, openDeleteModal }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 
               p-4 md:p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden relative"
    >
      {/* Decorative Gradient Circle */}
      <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16"></div>

      {/* Content */}
      <div className="relative space-y-3 md:space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 md:p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-sm">
              <Building2 className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base md:text-lg group-hover:text-blue-600 transition-colors duration-300 break-words">
                {client.name}
              </h3>
              <p className="text-xs md:text-sm text-slate-500 flex items-center flex-wrap">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(client.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-3 md:pt-4 border-t border-slate-100 gap-3">
          {/* Records Info */}
          <div className="flex items-center space-x-2">
            <div className="p-1.5 md:p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg">
              <FileText className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="font-semibold text-slate-900 text-sm md:text-base">
              {client.recordsCount}
            </span>
            <span className="text-xs md:text-sm text-slate-500">records</span>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap justify-end gap-2">
            <Link to={`/clients/${client.id || client._id}`}>
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 w-full md:w-auto"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>

            <Button
              size="sm"
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 border-0 shadow-sm hover:shadow-md transition-all duration-200 w-full md:w-auto"
              disabled={client.recordsCount > 0}
              onClick={() => openEditModal(client)}
              title={
                client.recordsCount > 0
                  ? "Delete records first to edit"
                  : "Edit client"
              }
            >
              <Edit3 className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              className="bg-red-50 hover:bg-red-100 text-red-600 border-0 shadow-sm hover:shadow-md transition-all duration-200 w-full md:w-auto"
              disabled={client.recordsCount > 0}
              onClick={() => openDeleteModal(client)}
              title={
                client.recordsCount > 0 ? "Delete records first" : "Delete client"
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const EditModal = () => (
    <Modal
      isOpen={showEditModal}
      onClose={() => {
        setShowEditModal(false);
        setEditingClient(null);
        setNewClientName("");
      }}
      title="Edit Client"
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl mb-4">
            <Edit3 className="h-8 w-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Edit Client</h3>
          <p className="text-slate-600 text-sm">Update the client name below</p>
        </div>

        <Input
          label="Client Name"
          value={newClientName}
          onChange={(e) => setNewClientName(e.target.value)}
          placeholder="Enter new client name"
          maxLength={500}
          required
          className="border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={() => {
              setShowEditModal(false);
              setEditingClient(null);
              setNewClientName("");
            }}
            className="border-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditClient}
            isLoading={isUpdating}
            disabled={!newClientName.trim()}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            {isUpdating ? "Updating..." : "Update Client"}
          </Button>
        </div>
      </div>
    </Modal>
  );

  const DeleteModal = () => (
    <Modal
      isOpen={showDeleteModal}
      onClose={() => {
        setShowDeleteModal(false);
        setDeletingClient(null);
      }}
      title="Delete Client"
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Delete "{deletingClient?.name}"?
          </h3>
          <p className="text-slate-600 text-sm">
            This client has no records and will be permanently deleted. This action
            cannot be undone.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={() => {
              setShowDeleteModal(false);
              setDeletingClient(null);
            }}
            className="border-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteClient}
            isLoading={isDeleting}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            {isDeleting ? "Deleting..." : "Delete Client"}
          </Button>
        </div>
      </div>
    </Modal>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-slate-600 font-medium">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="max-w-8xl mx-auto px-1 sm:px-2 lg:px-2 py-6 sm:py-8 lg:py-12 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0"
        >
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">
                Client Management
              </h1>
            </div>
            <p className="text-slate-600 text-sm sm:text-base">
              Manage your clients and view their shipping records
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Client
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              title: "Total Clients",
              value: clients.length,
              icon: Users,
              color: "blue",
            },
            {
              title: "Total Records",
              value: clients.reduce((sum, c) => sum + c.recordsCount, 0),
              icon: FileText,
              color: "emerald",
            },
            {
              title: "Active This Week",
              value: clients.filter(
                (c) =>
                  new Date(c.updatedAt) >
                  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length,
              icon: TrendingUp,
              color: "purple",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border-2 border-${stat.color}-200 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 rounded-xl`}
                >
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search and Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-6"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-md transition-all duration-200 ${viewMode === "table"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all duration-200 ${viewMode === "grid"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Clients Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {filteredClients.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-12 sm:p-16 text-center">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full animate-pulse"></div>
                <Users className="h-10 w-10 text-slate-400 relative z-10" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                {searchTerm ? "No clients found" : "No clients yet"}
              </h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm sm:text-base">
                {searchTerm
                  ? "Try adjusting your search terms to find what you're looking for"
                  : "Get started by adding your first client to begin managing shipping records"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add Your First Client
                </Button>
              )}
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClients.map((client, index) => (
                    <ClientCard key={client.id} client={client} index={index} />
                  ))}
                </div>
              ) : (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
                  <Table
                    data={filteredClients}
                    columns={columns}
                    className="border-0"
                  />
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Add Client Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setNewClientName("");
          }}
          title="Add New Client"
        >
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-4">
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Add New Client
              </h3>
              <p className="text-slate-600 text-sm">
                Enter the client information below
              </p>
            </div>

            <Input
              label="Client Name"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="Enter client name"
              maxLength={500}
              required
              className="border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setNewClientName("");
                }}
                className="border-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddClient}
                isLoading={isCreating}
                disabled={!newClientName.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
              >
                {isCreating ? "Adding..." : "Add Client"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Client Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingClient(null);
            setNewClientName("");
          }}
          title="Edit Client"
        >
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl mb-4">
                <Edit3 className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Edit Client
              </h3>
              <p className="text-slate-600 text-sm">Update the client name below</p>
            </div>

            <Input
              label="Client Name"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="Enter new client name"
              maxLength={500}
              required
              className="border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingClient(null);
                  setNewClientName("");
                }}
                className="border-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditClient}
                isLoading={isUpdating}
                disabled={!newClientName.trim()}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
              >
                {isUpdating ? "Updating..." : "Update Client"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Client Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingClient(null);
          }}
          title="Delete Client"
        >
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Delete "{deletingClient?.name}"?
              </h3>
              <p className="text-slate-600 text-sm">
                This client has no records and will be permanently deleted. This
                action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingClient(null);
                }}
                className="border-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteClient}
                isLoading={isDeleting}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
              >
                {isDeleting ? "Deleting..." : "Delete Client"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Clients;
