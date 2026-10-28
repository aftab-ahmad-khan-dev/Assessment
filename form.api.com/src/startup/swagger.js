// src/startup/swagger.js
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Al-Shiraa Logistics – OCR Sticker Intake API",
      description: `
API for the Al-Shiraa Logistics web application.

**Core Functionality**:
- JWT-based admin authentication
- Upload and process shipping stickers/invoices via Gemini OCR
- Review, edit, and save structured records (individual or business invoices)
- Manage clients/businesses (create, update, delete, list with record counts)
- Browse, search, paginate, and filter records

**Key References**:
- SRS v1.0 §3 Scope
- SRS §5 High-Level Flow (Capture → Review/Edit → Assign Client → Save)
- SRS §6 Field Mapping (Sender, Recipient, Tracking, Additional, Contents)
- SRS §10 Validations (Required fields, length limits, formats)
- SRS §13 API Endpoints (illustrative)

Supported record types: individual-invoice, business-invoice
Image storage: Cloudinary (secure URLs returned in responses)
Authentication: JWT Bearer token required for protected endpoints
      `,
      version: "1.0.0",
      contact: {
        name: "Next Level Software",
        email: "aftab@thenextlevelsoftware.com",
        url: "https://thenextlevelsoftware.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:{port}",
        description: "Local development server",
        variables: {
          port: {
            enum: ["3000", "5000", "8000"],
            default: "3000",
          },
        },
      },
      {
        url: "https://ec2-3-28-192-218.me-central-1.compute.amazonaws.com",
        description: "Production server (AWS EC2 Bahrain)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtained from login endpoint",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            statusCode: { type: "integer", example: 400 },
            isSuccess: { type: "boolean", example: false },
            message: { type: "string", example: "Invalid input" },
            error: { type: "object" },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            statusCode: { type: "integer", example: 200 },
            isSuccess: { type: "boolean", example: true },
            message: { type: "string", example: "Operation successful" },
            data: { type: "object" },
          },
        },
        Sender: {
          type: "object",
          properties: {
            name: { type: "string", example: "Muhammad Ali" },
            phone: { type: "string", example: "+96512345678" },
            email: { type: "string", format: "email", example: "ali@example.com" },
            address: { type: "string", example: "Block 3, Street 12, Kuwait City" },
          },
        },
        Recipient: {
          type: "object",
          properties: {
            name: { type: "string", example: "Fatima Khan" },
            phone: { type: "string", example: "+96598765432" },
            address: { type: "string", example: "Salmiya, Kuwait" },
          },
        },
        Tracking: {
          type: "object",
          properties: {
            barcodeNumber: { type: "string", example: "ABC123456789" },
            internalNumber: { type: "string", example: "INT-987654" },
            distributionCode: { type: "string", example: "KUW-001" },
            barcodeNumbers: { type: "array", items: { type: "string" } },
            internalNumbers: { type: "array", items: { type: "string" } },
          },
        },
        AdditionalInfo: {
          type: "object",
          properties: {
            city: { type: "string", example: "Kuwait City" },
            shippingDate: { type: "string", format: "date", example: "2026-01-20" },
            totalWeight: { type: "number", example: 4.5 },
            totalPieces: { type: "integer", example: 3 },
            quantity: { type: "integer", example: 2 },
            price: { type: "number", example: 45.99 },
            parcels: { type: "string", example: "Parcel 1 of 2" },
            paymentMethod: {
              type: "string",
              enum: ["Cash", "Card", "KNET", "Other"],
              example: "KNET",
            },
          },
        },
        ContentItem: {
          type: "object",
          properties: {
            name: { type: "string", example: "Mobile Phone" },
            qty: { type: "integer", example: 2 },
            price: { type: "number", example: 15.99 },
          },
          required: ["name"],
        },
        Record: {
          type: "object",
          properties: {
            _id: { type: "string", example: "63f8b123456789abcdef1234" },
            clientName: { type: "string", example: "Kuwait Trading Co" },
            sender: { $ref: "#/components/schemas/Sender" },
            recipient: { $ref: "#/components/schemas/Recipient" },
            tracking: { $ref: "#/components/schemas/Tracking" },
            additional: { $ref: "#/components/schemas/AdditionalInfo" },
            contents: {
              type: "array",
              items: { $ref: "#/components/schemas/ContentItem" },
            },
            additionalInfo: { type: "string" },
            imageUrl: { type: "string", format: "uri" },
            commulativeImgUrls: {
              type: "array",
              items: { type: "string", format: "uri" },
            },
            invoiceType: {
              type: "string",
              enum: ["individual-invoice", "business-invoice"],
              example: "business-invoice",
            },
            confidenceScores: {
              type: "object",
              additionalProperties: { type: "number" },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Client: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", example: "Kuwait Trading Co" },
            recordsCount: { type: "integer", example: 12 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "Unauthorized – missing or invalid token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        NotFound: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        BadRequest: {
          description: "Invalid input or validation failed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Scan", description: "OCR scanning & record creation" },
      { name: "Records", description: "Individual & Business records management" },
      { name: "Clients", description: "Client/business management" },
      { name: "Dashboard", description: "Statistics and overview" },
    ],
    paths: {
      // -----------------------------------------------------------------------
      // Scan endpoints (OCR processing & creation)
      // -----------------------------------------------------------------------
      "/api/ocr/process": {
        post: {
          summary: "Process parsed OCR data",
          description:
            "Receives Gemini-parsed data and returns it for review/edit (SRS §5 Step 2)",
          tags: ["Scan"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["parsedData"],
                  properties: {
                    parsedData: { type: "object" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Parsed data ready",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SuccessResponse" },
                },
              },
            },
            400: { $ref: "#/components/responses/BadRequest" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/api/records": {
        post: {
          summary: "Create new shipment record",
          description:
            "Saves reviewed/edited record with client assignment (SRS §5 Steps 4-5)",
          tags: ["Records"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["tracking"],
                  properties: {
                    clientName: { type: "string" },
                    sender: { $ref: "#/components/schemas/Sender" },
                    recipient: { $ref: "#/components/schemas/Recipient" },
                    tracking: { $ref: "#/components/schemas/Tracking" },
                    additional: { $ref: "#/components/schemas/AdditionalInfo" },
                    contents: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ContentItem" },
                    },
                    imageUrl: { type: "string" },
                    invoiceType: {
                      enum: ["individual-invoice", "business-invoice"],
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Record created",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      record: { $ref: "#/components/schemas/Record" },
                    },
                  },
                },
              },
            },
            400: { $ref: "#/components/responses/BadRequest" },
          },
        },
        get: {
          summary: "List filtered/paginated records",
          description:
            "Browse records with search, date, barcode, type filters (SRS §5 Step 6)",
          tags: ["Records"],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "barcode", in: "query", schema: { type: "string" } },
            { name: "search", in: "query", schema: { type: "string" } },
            {
              name: "dateFrom",
              in: "query",
              schema: { type: "string", format: "date" },
            },
            {
              name: "dateTo",
              in: "query",
              schema: { type: "string", format: "date" },
            },
            {
              name: "invoiceType",
              in: "query",
              schema: {
                type: "string",
                enum: ["individual-invoice", "business-invoice"],
              },
            },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          ],
          responses: {
            200: {
              description: "Paginated records",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Record" },
                      },
                      total: { type: "integer" },
                      page: { type: "integer" },
                      limit: { type: "integer" },
                      totalPages: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      // -----------------------------------------------------------------------
      // Clients endpoints
      // -----------------------------------------------------------------------
      "/api/clients": {
        post: {
          summary: "Create new client",
          description: "Creates a client (can be done inline during record save)",
          tags: ["Clients"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: { name: { type: "string" } },
                },
              },
            },
          },
          responses: {
            201: { description: "Client created" },
            409: { description: "Client name already exists" },
          },
        },
        get: {
          summary: "List clients with record counts",
          description:
            "Paginated list of clients with recordsCount and last activity",
          tags: ["Clients"],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          ],
          responses: {
            200: {
              description: "Paginated clients",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Client" },
                      },
                      total: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/clients/{id}": {
        get: {
          summary: "Get single client details",
          tags: ["Clients"],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Client details with records" },
            404: { $ref: "#/components/responses/NotFound" },
          },
        },
        put: {
          summary: "Update client name",
          tags: ["Clients"],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: { name: { type: "string" } },
                },
              },
            },
          },
          responses: {
            200: { description: "Client updated" },
            409: { description: "Name already exists" },
          },
        },
        delete: {
          summary: "Delete client (only if no records)",
          tags: ["Clients"],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Client deleted" },
            400: { description: "Cannot delete client with records" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js", "./src/startup/routes.js"],
};

const specs = swaggerJsdoc(options);

export default specs;
