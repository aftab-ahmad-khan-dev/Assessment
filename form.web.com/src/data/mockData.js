export default {
  clients: [
    {
      id: '1',
      name: 'ABC Logistics Corp',
      recordsCount: 15,
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-15T14:30:00Z'
    },
    {
      id: '2', 
      name: 'Express Shipping Ltd',
      recordsCount: 8,
      createdAt: '2024-11-20T09:15:00Z',
      updatedAt: '2024-12-10T16:45:00Z'
    },
    {
      id: '3',
      name: 'Global Trade Solutions',
      recordsCount: 23,
      createdAt: '2024-10-15T11:30:00Z',
      updatedAt: '2024-12-14T13:20:00Z'
    }
  ],
  records: [
    {
      id: '1',
      clientId: '1',
      clientName: 'ABC Logistics Corp',
      barcodeNumber: '1234567890123',
      internalNumber: 'INT-2024-001',
      distributionCode: 'DC-NYC-001',
      senderName: 'John Smith',
      senderAddress: '123 Main St\nNew York, NY 10001\nUSA',
      senderPhone: '+1-555-0123',
      recipientName: 'Jane Doe',
      recipientAddress: '456 Oak Ave\nLos Angeles, CA 90210\nUSA',
      recipientPhone: '+1-555-0456',
      shippingDate: '2024-12-15',
      totalWeight: '2.5',
      totalPieces: '3',
      contents: 'Electronics - Laptop accessories\nFragile items\nHandle with care',
      additionalInfo: 'Express delivery required\nInsurance: $500',
      imageUrl: 'https://images.pexels.com/photos/4481327/pexels-photo-4481327.jpeg?auto=compress&cs=tinysrgb&w=800',
      createdAt: '2024-12-15T10:30:00Z',
      updatedAt: '2024-12-15T10:30:00Z'
    },
    {
      id: '2',
      clientId: '2',
      clientName: 'Express Shipping Ltd',
      barcodeNumber: '9876543210987',
      internalNumber: 'INT-2024-002',
      distributionCode: 'DC-CHI-002',
      senderName: 'Mike Johnson',
      senderAddress: '789 Business Blvd\nChicago, IL 60601\nUSA',
      senderPhone: '+1-555-0789',
      recipientName: 'Sarah Wilson',
      recipientAddress: '321 Residential St\nMiami, FL 33101\nUSA',
      recipientPhone: '+1-555-0321',
      shippingDate: '2024-12-14',
      totalWeight: '1.8',
      totalPieces: '1',
      contents: 'Documents\nLegal papers',
      additionalInfo: 'Signature required',
      imageUrl: 'https://images.pexels.com/photos/4481327/pexels-photo-4481327.jpeg?auto=compress&cs=tinysrgb&w=800',
      createdAt: '2024-12-14T15:45:00Z',
      updatedAt: '2024-12-14T15:45:00Z'
    }
  ]
};