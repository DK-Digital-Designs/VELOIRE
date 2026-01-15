import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                fleet: resolve(__dirname, 'pages/fleet.html'),
                about: resolve(__dirname, 'pages/about.html'),
                partnership: resolve(__dirname, 'pages/partnership.html'),
                request: resolve(__dirname, 'pages/request-access.html'),
                vehicle: resolve(__dirname, 'pages/vehicle.html'),
                admin: resolve(__dirname, 'pages/admin.html'),
            }
        }
    },
    server: {
        proxy: {
            '/api': 'http://localhost:3000'
        }
    }
});
