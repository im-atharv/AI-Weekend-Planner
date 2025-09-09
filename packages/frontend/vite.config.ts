import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, ".", "");
    return {
        define: {
            "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
            "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
            "process.env.GEOAPIFY_API_KEY": JSON.stringify(env.GEOAPIFY_API_KEY),
        },
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
                shared: path.resolve(__dirname, "../shared"),
            },
        },
        server: {
            // Add this headers configuration
            headers: {
                'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
            },
            proxy: {
                "/api": {
                    target: "http://localhost:3001",
                    changeOrigin: true,
                },
            },
        },
    };
});
