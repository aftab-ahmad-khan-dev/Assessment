# Technical Notes – Frontend

Key libraries & decisions:

- Vite + React 18 (fast dev & build)
- Tailwind CSS + lucide-react icons
- Framer Motion → smooth animations
- react-router-dom v6+ → navigation
- react-hot-toast → notifications
- Compressor.js → image size reduction before upload
- Tesseract.js → client-side OCR fallback / preview
- PapaParse + jsPDF → CSV & PDF export
- Context API → auth / global state
- Gemini V3

# Important files:

- src/App.jsx → router setup
- src/pages/NewScan.jsx → main scanning logic
- src/pages/Dashboard.jsx → stats & cards
- src/context/AuthContext.jsx → login/session
- src/Hooks/ → For Search Debounce and LocalStorage Logic
- src/Context/ → For Search Handling All api calls
- src/MockData/ → For Mock-data for testing Purpose
- src/Utils/Compression → For Img compression for saving in Server
- src/Utils/Export → For Handling export CSV ut
- src/Utils/OCR → For Mock-data for testing Purpose
- src/Utils/Regex → For Mock-data for testing Purpose
- src/Utils/Validation → For Mock-data for testing Purpose

Environment:

# ==================================================== Local NLS Gemini API Key

## VITE_GEMINI_API_SECRET=AIzaSyDo4CAUq2gvjCyR90ayTYiUmrw959gcsVU (Testing)

## VITE_GEMINI_API_SECRET=AIzaSyDLOL9PrBDM5k0Sh5seFSCvaopvmv_mOfo (Testing)

## VITE_GEMINI_API_SECRET=AIzaSyCp8amn8DI_hac-2idvg6W3niJOW74eRng (Testing)

## VITE_GEMINI_API_SECRET=AIzaSyACv6JgjvrJeEiFZjcKWR7TOQOnbyZN2Jw (Testing)

# ==================================================== Client LIVE Gemini API Key

# VITE_GEMINI_API_SECRET=AIzaSyDyqMLj5cAMYx81Tldtx7BclDr7XEXNg_w

# VITE_GEMINI_API_SECRET=AIzaSyDA34rwpC75mt8DbkC5zZLaJhp8ppXGd5k (Pro Being Used)

# ==================================================== Client & Server Paths

# VITE_BASE_URL=http://localhost:3000/ap/admin

# VITE_FILE_URL=http://localhost:3000/

# VITE_BASE_URL=http://ec2-3-28-192-218.me-central-1.compute.amazonaws.com/api/ap/admin (Client Path)

# VITE_FILE_URL=http://ec2-3-28-192-218.me-central-1.compute.amazonaws.com/api/ (Backend Path)
