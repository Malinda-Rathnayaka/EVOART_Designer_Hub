const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Ensure environment variables from backend/.env are loaded regardless of execution directory
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Logical Area 1: Initialize Cloudinary configuration from environment variables
const configureCloudinary = () => {
  // Support full CLOUDINARY_URL environment variable if provided
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
      cloudinary_url: process.env.CLOUDINARY_URL.trim(),
      secure: true,
    });
    return true;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName.trim(),
      api_key: apiKey.trim(),
      api_secret: apiSecret.trim(),
      secure: true,
    });
    return true;
  }
  return false;
};

// Logical Area 2: Check whether valid Cloudinary API keys are configured
const isCloudinaryConfigured = () => {
  if (process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_URL.includes('your_')) {
    return true;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  return !!(
    cloudName &&
    apiKey &&
    apiSecret &&
    !cloudName.includes('your_') &&
    !apiKey.includes('your_')
  );
};

// Immediately invoke configuration on module load
configureCloudinary();

/**
 * Logical Area 3: Upload reference image or file to Cloudinary
 * - If Cloudinary keys exist in .env: uploads directly to Cloudinary and cleans up local temp file.
 * - If Cloudinary keys are not yet provided: gracefully keeps the local file as fallback.
 *
 * @param {Object} file - Multer file object (contains path, filename, originalname, mimetype, size)
 * @returns {Promise<Object>} Formatted reference file document for MongoDB
 */
const uploadReferenceFile = async (file) => {
  // Check if user has provided Cloudinary API keys in .env
  if (isCloudinaryConfigured()) {
    try {
      configureCloudinary(); // Ensure latest env values applied

      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'evo_art/references',
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
      });

      // Remove local temporary file after successful Cloudinary upload
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (cleanupErr) {
        console.warn('[Cloudinary Cleanup] Temp file cleanup warning:', cleanupErr.message);
      }

      console.log(`[Cloudinary] Successfully uploaded reference image: ${result.secure_url}`);

      return {
        filename: file.filename,
        originalName: file.originalname,
        path: result.secure_url,
        url: result.secure_url,
        publicId: result.public_id,
        storageType: 'cloudinary',
        mimetype: file.mimetype,
        size: result.bytes || file.size,
      };
    } catch (uploadError) {
      console.error('[Cloudinary Error] Upload failed, falling back to local file storage:', uploadError.message);
      // Fall through to local fallback below
    }
  } else {
    console.log('[Cloudinary Info] Cloudinary credentials not configured in .env yet. Storing reference file locally.');
  }

  // Fallback: Store locally if Cloudinary credentials are not configured or upload fails
  return {
    filename: file.filename,
    originalName: file.originalname,
    path: file.path,
    url: '',
    publicId: null,
    storageType: 'local',
    mimetype: file.mimetype,
    size: file.size,
  };
};

/**
 * Logical Area 4: Delete reference asset from Cloudinary
 *
 * @param {string} publicId - Cloudinary asset public_id
 * @param {string} [resourceType='image'] - Cloudinary resource type
 */
const deleteCloudinaryFile = async (publicId, resourceType = 'image') => {
  if (!isCloudinaryConfigured() || !publicId) {
    return null;
  }

  try {
    configureCloudinary();
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log(`[Cloudinary] Deleted asset ${publicId}:`, result);
    return result;
  } catch (error) {
    console.error(`[Cloudinary Delete Error] Failed to delete ${publicId}:`, error.message);
    return null;
  }
};

module.exports = {
  isCloudinaryConfigured,
  uploadReferenceFile,
  deleteCloudinaryFile,
};

