import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true,   // 👈 exposes it to the network (your phone)
        // port: 5173,   // 👈 optional (forces a fixed port)
    },
});
