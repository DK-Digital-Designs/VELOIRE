/**
 * Media Service - Handles image uploads and metadata
 * Currently stubbed for Phase 1 as per implementation plan.
 */

export interface UploadResult {
    url: string;
    isPrimary?: boolean;
}

export const uploadVehicleImage = async (file: any): Promise<UploadResult> => {
    // Stubbed behaviour: Return a placeholder URL or the file path if local
    console.log('[MediaService] Uploading image stub', file);

    return {
        url: 'https://images.unsplash.com/photo-1542362567-b05503f39630?auto=format&fit=crop&q=80&w=1200',
        isPrimary: false
    };
};

export const deleteImage = async (url: string): Promise<void> => {
    console.log('[MediaService] Deleting image stub', url);
};
