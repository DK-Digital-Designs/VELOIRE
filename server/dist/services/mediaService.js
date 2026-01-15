"use strict";
/**
 * Media Service - Handles image uploads and metadata
 * Currently stubbed for Phase 1 as per implementation plan.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.uploadVehicleImage = void 0;
const uploadVehicleImage = async (file) => {
    // Stubbed behaviour: Return a placeholder URL or the file path if local
    console.log('[MediaService] Uploading image stub', file);
    return {
        url: 'https://images.unsplash.com/photo-1542362567-b05503f39630?auto=format&fit=crop&q=80&w=1200',
        isPrimary: false
    };
};
exports.uploadVehicleImage = uploadVehicleImage;
const deleteImage = async (url) => {
    console.log('[MediaService] Deleting image stub', url);
};
exports.deleteImage = deleteImage;
