const path = require('path');
const fs = require('fs');
const Submission = require('../models/Submission');
const Project = require('../models/Project');

// @desc    Download or preview an uploaded file (protected)
// @route   GET /api/files/:type/:filename
// @access  Private (JWT protected)
const getFile = async (req, res, next) => {
  try {
    const { type, filename } = req.params;

    if (!['references', 'submissions'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type requested',
      });
    }

    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(__dirname, '..', 'uploads', type, safeFilename);

    // If reference file is hosted on Cloudinary, redirect directly to Cloudinary CDN
    if (type === 'references') {
      const projectWithFile = await Project.findOne({
        'referenceFiles.filename': safeFilename,
      });

      if (projectWithFile) {
        const refFile = projectWithFile.referenceFiles.find(
          (f) => f.filename === safeFilename
        );
        if (refFile && refFile.url) {
          return res.redirect(refFile.url);
        }
      }
    }

    // If submission file is hosted on Google Drive or external cloud, check access and redirect
    if (type === 'submissions') {
      const submissionWithFile = await Submission.findOne({
        'files.filename': safeFilename,
      });

      if (submissionWithFile) {
        // Access control for private submissions:
        // Only Admin OR the designer who submitted the work can access
        if (
          req.user.role !== 'admin' &&
          submissionWithFile.designer.toString() !== req.user._id.toString()
        ) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You do not have permission to view this submission file.',
          });
        }

        const subFile = submissionWithFile.files.find(
          (f) => f.filename === safeFilename
        );
        if (subFile && subFile.url) {
          return res.redirect(subFile.url);
        }
      }
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server',
      });
    }

    // Access control for private submissions:
    // Only Admin OR the designer who submitted the work can access submissions files
    if (type === 'submissions' && req.user.role !== 'admin') {
      const submissionWithFile = await Submission.findOne({
        'files.filename': safeFilename,
        designer: req.user._id,
      });

      if (!submissionWithFile) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to view this submission file.',
        });
      }
    }

    // If references: accessible to all authenticated users (both admin and designers)
    return res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

module.exports = { getFile };
