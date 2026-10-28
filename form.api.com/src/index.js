import connectDatabase from "./database/database.js";
import { app } from "./app.js";
import initializeSocket from "./startup/socket.js";
import specs from "./startup/swagger.js";
import swaggerUi from "swagger-ui-express";
const startServer = async () => {
  try {
    await connectDatabase();
    // ── Mount Swagger UI ────────────────────────────────────────
    app.use(
      "/ocr-api-docs",
      swaggerUi.serve,
      swaggerUi.setup(specs, {
        explorer: true,
        customCss: `
          .swagger-ui .topbar { background-color: #4f46e5; }
          .swagger-ui .info { margin: 20px 0; }
        `,
        customSiteTitle: "Al-Shiraa Logistics API Docs",
        swaggerOptions: {
          persistAuthorization: true,
        },
      }),
    );

    const { server } = initializeSocket(app);
    const PORT = process.env.PORT || 8000;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(
        `API Documentation available at http://localhost:${PORT}/api-docs`,
      );
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
};

startServer();
