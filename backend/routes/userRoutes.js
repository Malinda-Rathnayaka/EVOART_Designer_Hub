const express = require('express');
const router = express.Router();
const {
  createDesigner,
  getDesigners,
  updateDesigner,
  deleteDesigner,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All designer user management routes are restricted to Admin
router.use(protect, authorize('admin'));

router.route('/designers')
  .post(createDesigner)
  .get(getDesigners);

router.route('/designers/:id')
  .put(updateDesigner)
  .delete(deleteDesigner);

module.exports = router;

