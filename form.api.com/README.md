# ==================================================About Project================================================

# الشراع لوجستيك | Al-Shiraa Logistics

AI-powered web app to scan shipping stickers & invoices using **Google Gemini API** (primary OCR) + Tesseract.js fallback. Track individual & business shipments with dashboard stats, search, CSV export.

## ✨ Features

- Upload / camera capture of shipping stickers
- **Gemini API** extracts: barcode, sender, receiver, weight (KG), pieces, date, client/business details
- Tesseract.js as quick/low-cost fallback
- Separate flows: Individual vs Business records
- Real-time dashboard (records count, total KG, total pieces)
- Search/filter + CSV export
- Admin auth (JWT)

```bash 🚀 Quick Start
cd ocr.api.com
cp  .env
npm i
nodemon

🛠 Tech Stack
Frontend: React, Vite, Tailwind, lucide-react, framer-motion, Compressor.js (image optimize), react-hot-toast
Backend: Node.js, Express, Mongoose, Cloudinary (images), JWT, Multer
OCR: Google Gemini API (main – multimodal vision), Tesseract.js (fallback)
```

# ==================================================Devops Guide================================================

# Node Express template project

This project is based on a GitLab [Project Template](https://docs.gitlab.com/ee/user/project/#create-a-project-from-a-built-in-template).

Improvements can be proposed in the [original project](https://gitlab.com/gitlab-org/project-templates/express).

## CI/CD with Auto DevOps

This template is compatible with [Auto DevOps](https://docs.gitlab.com/ee/topics/autodevops/).

If Auto DevOps is not already enabled for this project, you can [turn it on](https://docs.gitlab.com/ee/topics/autodevops/#enable-or-disable-auto-devops) in the project settings.

### Developing with Gitpod

This template has a fully-automated dev setup for [Gitpod](https://docs.gitlab.com/ee/integration/gitpod.html).

If you open this project in Gitpod, you'll get all Node dependencies pre-installed.

### Uzair's pending points

defaultAddress population in get by filter of user in admin side because default address crud is pending
Other document to be placed in required later in createion of vendor when there reference cruds are complete like vendor manager
driver dashboard data from mobile app to show in frontend
there is no relation in product table for reviews

<!-- ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════===== Termius Sockets Default file-->

server {
listen 80 default_server;
listen [::]:80 default_server;

    root /var/www/html;

    # Add index.html to the list
    index index.html index.htm;

    server_name _;

    location / {
        # Serve Angular's index.html for all routes
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

# location /socket.io/ {

# proxy_pass http://localhost:3000;

# proxy_http_version 1.1;

# proxy_set_header Upgrade $http_upgrade;

# proxy_set_header Connection "upgrade";

# proxy_set_header Host $host;

# }

    # Optional: Add gzip compression for better performance
    gzip on;
    gzip_types text/plain application/javascript text/css application/json text/xml application/xml+rss text/javascript;

    # Serve static files (optional if you have assets like images, CSS, JS)
    location /assets/ {
        try_files $uri =404;
    }

    # Optional: Prevent access to hidden files and directories
    location ~ /\. {
        deny all;
    }

}
