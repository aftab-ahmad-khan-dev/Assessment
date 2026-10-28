Markdown# Backend Folder Structure & Conventions

This backend is a **modular Express + Mongoose** application designed for scalability, supporting multiple client types (admin panel, future vendor panel, mobile app API) through **nested route folders**.

## Overview – High-Level Structure

```bash
backend/
├── src/                           # Core source code
│   ├── controllers/               # Business logic / request handlers
│   │   └── ap/                    # Admin Panel (AP) controllers
│   │       └── admin.controller.js
│   ├── routes/                    # Express route definitions
│   │   ├── ap/                    # Admin Panel routes
│   │   │   ├── index.js           # Merges all AP routes (important!)
│   │   │   └── ...other files
│   │   └── file.js                # Standalone routes (e.g. file upload)
│   ├── models/                    # Mongoose schemas
│   │   ├── client.model.js
│   │   └── record.model.js
│   ├── middlewares/               # Custom middleware (auth, validation, etc.)
│   ├── services/                  # Reusable utilities & services
│   ├── startup/                   # Application bootstrap & config
│   │   ├── routes.js              # Central route mounting point
│   │   ├── swagger.js             # OpenAPI / Swagger configuration
│   │   ├── socket.js              # Socket.IO setup
│   │   ├── models.js              # Exports all models
│   │   └── ...other startup files
│   ├── database/                  # MongoDB connection logic
│   ├── constants.js               # Enums, model names, magic strings
│   ├── app.js                     # Express app factory (middleware setup)
│   └── index.js                   # Server entry point (starts HTTP + Socket)
├── templates/                     # Email HTML templates (nodemailer)
├── public/                        # Static files (if served)
├── tests/                         # Unit & integration tests
├── .env.dev                       # Environment variables (development)
├── package.json
└── Dockerfile                     # Optional Docker support

Key Conventions
1. Nested Folders for Different Client Types
To keep code organized when supporting multiple interfaces:
## Multifolder  For Panels (Controller)
ap/ → Admin Panel (current main focus)
vp/ → Vendor Panel (future)
ma/ → Mobile App API endpoints (future)

## Multifolder  For Panels (route)
Each client type has its own subfolders:
controllers/ap/         ← Admin-specific controllers
routes/ap/              ← Admin-specific routes

2. Route Merging Pattern (Very Important!)
Every nested route folder (e.g. routes/ap/) must contain an index.js file that:

Imports all individual route files in that folder
Merges them into one Express router
Exports the merged router

Example: routes/ap/index.js
JavaScriptimport express from 'express';
import { adminController } from '../../controllers/ap/admin.controller.js';

const router = express.Router();

router.post('/records', adminController.createRecord);
router.get('/records', adminController.getRecords);
router.get('/records/:id', adminController.getRecord);
// ... more endpoints

export default router;
Mounting in startup/routes.js
JavaScriptimport adminPanelRoute from "../routes/ap/index.js";
import fileRoute from "../routes/file.js";
## Main file for handling all routes
export default function (app) {
  app.use("/ap", adminPanelRoute);     // → /ap/records, /ap/clients, ...
  app.use("/file", fileRoute);
  // app.use("/vp", vendorPanelRoute); // future
}
3. Error & Response Handling (Reusable)
All controllers are wrapped with asyncHandler to automatically catch errors.
## Reuseable Component
Responses use generateApiResponse for consistent JSON shape.
services/asyncHandler.js
JavaScriptconst asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    console.error(error);
    return generateErrorApiResponse(res, { error });
  }
};

export { asyncHandler };
services/utilities.service.js (response helpers)
JavaScriptexport const generateApiResponse = (res, statusCode, isSuccess, message, data = {}) => {
  return res.status(statusCode).json({
    statusCode,
    isSuccess,
    message,
    ...data,
  });
};

export const generateErrorApiResponse = (res, data) => {
  return res.status(500).json({
    statusCode: 500,
    isSuccess: false,
    message: "Internal server error",
    ...data,
  });
};
Services Folder – Quick Reference
src/services/ contains reusable, focused utilities.

File / ModuleMain PurposeKey Exports /
FunctionsasyncHandler.jsWraps async controllers → auto error handlingasyncHandler(fn)auth.service.jsJWT token creation & validationtokenCreator(user)
email.service.jsNodemailer + OneSignal email sendingsendEmailOnRegistration, sendEmailForResetCodefile.service.
jsFile upload (local/AWS), compression, removaluploadASingleFile, removeFile, downloadImageToFilenotification.
service.jsOneSignal push notificationscreateOneSignalNotificationpagination.service.jsPaginated + filtered
queriespaginationFiltrationData(...)password.service.jsBcrypt password hashing & comparisonencryptPassword,
compareEncryptedPasswordpayment.service.jsMyFatoorah payment integrationinitPayment, executeMyFatoorahPayment, etc.
utilities.service.jsGeneral helpers (random strings, validation, responses)generateApiResponse,
randomStringGenerator, etc.
Templates Folder – Email HTML
All files are HTML templates with placeholders (||NAME||, ||CODE||, etc.) replaced at runtime.













































FilePurposeLanguagehealth.htmlDev-mode server health pageENresetPassword.htmlPassword reset codeENresetPasswordAr.htmlArabic versionARuserRegistration.htmlWelcome + verification codeENuserRegistrationAr.htmlArabic versionARverificationCode.htmlGeneric code verificationENverificationCodeAr.htmlArabic versionAR
```
