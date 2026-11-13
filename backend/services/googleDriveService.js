const fs = require('fs');
const path = require('path');

/**
 * ==============================================================================
 * EVO ART DESIGNER PLATFORM - GOOGLE DRIVE DELIVERABLE STORAGE SERVICE
 * ==============================================================================
 * Handles storing designer deliverable files directly into Google Drive using
 * the link provided in the .env file.
 *
 * Supported .env configurations:
 *   1. GOOGLE_DRIVE_UPLOAD_URL: Webhook or Google Apps Script Web App URL that
 *      receives uploaded files and creates them in Google Drive.
 *   2. GOOGLE_DRIVE_FOLDER_LINK (or GOOGLE_DRIVE_LINK): Direct Google Drive folder
 *      link (e.g. https://drive.google.com/drive/folders/...) where client deliverables
 *      are centralized and accessed.
 *
 * Plug-and-Play Google Apps Script Web App (optional 1-minute setup for automatic Drive storage):
 * ------------------------------------------------------------------------------
 * function doPost(e) {
 *   try {
 *     var data = JSON.parse(e.postData.contents);
 *     var decoded = Utilities.base64Decode(data.fileData);
 *     var blob = Utilities.newBlob(decoded, data.mimetype, data.filename);
 *     var folder = DriveApp.getRootFolder(); // or DriveApp.getFolderById("YOUR_FOLDER_ID")
 *     var file = folder.createFile(blob);
 *     file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
 *     return ContentService.createTextOutput(JSON.stringify({
 *       success: true,
 *       url: file.getUrl(),
 *       fileId: file.getId()
 *     })).setMimeType(ContentService.MimeType.JSON);
 *   } catch(err) {
 *     return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 * }
 * ==============================================================================
 */

// Logical Area 1: Get Google Drive configuration from environment variables
const getGoogleDriveConfig = () => {
  const uploadUrl = (process.env.GOOGLE_DRIVE_UPLOAD_URL || '').trim();
  const folderLink = (
    process.env.GOOGLE_DRIVE_FOLDER_LINK ||
    process.env.GOOGLE_DRIVE_LINK ||
    ''
  ).trim();

  return {
    uploadUrl,
    folderLink,
    isConfigured: Boolean(uploadUrl || folderLink),
  };
};

// Logical Area 2: Check if Google Drive link is configured in .env
const isGoogleDriveConfigured = () => {
  return getGoogleDriveConfig().isConfigured;
};

/**
 * Logical Area 3: Upload deliverable file to Google Drive
 * - If GOOGLE_DRIVE_UPLOAD_URL is set: sends file payload to Google Drive endpoint
 * - If GOOGLE_DRIVE_FOLDER_LINK is set: associates with Google Drive folder link
 * - Fallback: stores locally if no Google Drive link is configured
 *
 * @param {Object} file - Multer file object (path, filename, originalname, mimetype, size)
 * @returns {Promise<Object>} Deliverable file metadata document for MongoDB
 */
const uploadDeliverableFile = async (file) => {
  const { uploadUrl, folderLink, isConfigured } = getGoogleDriveConfig();

  // Scenario A: An upload link / webhook endpoint is configured in .env
  if (uploadUrl) {
    try {
      console.log(`[Google Drive] Uploading deliverable "${file.originalname}" to Google Drive...`);

      const fileBuffer = fs.readFileSync(file.path);
      const base64Data = fileBuffer.toString('base64');

      const payload = {
        filename: file.originalname,
        mimetype: file.mimetype,
        fileData: base64Data,
        folderLink: folderLink || '',
      };

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result && (result.url || result.fileUrl || result.link || result.success)) {
        const driveUrl = result.url || result.fileUrl || result.link || folderLink;
        const driveFileId = result.fileId || result.id || null;

        // Clean up temporary local file after successful Google Drive upload
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (cleanupErr) {
          console.warn('[Google Drive Cleanup] Local temp file cleanup warning:', cleanupErr.message);
        }

        console.log(`[Google Drive] Successfully saved to Google Drive: ${driveUrl}`);

        return {
          filename: file.filename,
          originalName: file.originalname,
          path: driveUrl,
          url: driveUrl,
          driveFileId,
          storageType: 'google_drive',
          mimetype: file.mimetype,
          size: file.size,
        };
      } else {
        console.warn('[Google Drive] Endpoint responded without file URL. Using fallback folder link:', result);
      }
    } catch (uploadError) {
      console.error('[Google Drive Error] Direct upload to Drive failed, falling back:', uploadError.message);
      // Fall through to folder link or local fallback
    }
  }

  // Scenario B: A Google Drive folder link is configured in .env
  if (folderLink) {
    console.log(`[Google Drive] Deliverable "${file.originalname}" linked to Google Drive folder: ${folderLink}`);

    return {
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      url: folderLink,
      driveFileId: null,
      storageType: 'google_drive',
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  // Scenario C: No Google Drive link provided in .env yet — gracefully keep local file
  console.log('[Google Drive Info] Google Drive link not set in .env. Storing deliverable file locally.');
  return {
    filename: file.filename,
    originalName: file.originalname,
    path: file.path,
    url: '',
    driveFileId: null,
    storageType: 'local',
    mimetype: file.mimetype,
    size: file.size,
  };
};

module.exports = {
  isGoogleDriveConfigured,
  getGoogleDriveConfig,
  uploadDeliverableFile,
};

