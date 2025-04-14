
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      // To make HMR work inside the Lovable editor
      clientPort: mode === 'development' ? 443 : undefined,
      protocol: mode === 'development' ? 'wss' : 'ws'
    }
  },
  // For Lovable preview, we need to ensure the base path is set correctly
  base: "/",
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimize for development preview
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@/components/ui']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
}));
