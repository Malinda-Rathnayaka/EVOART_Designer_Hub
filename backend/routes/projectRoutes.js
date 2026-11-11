const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  toggleBiddingStatus,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadReferences } = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(authorize('admin'), uploadReferences.array('referenceFiles', 10), createProject);

router.route('/:id')
  .get(getProjectById)
  .put(authorize('admin'), uploadReferences.array('referenceFiles', 10), updateProject)
  .delete(authorize('admin'), deleteProject);

router.route('/:id/bidding')
  .patch(authorize('admin'), toggleBiddingStatus);

module.exports = router;
