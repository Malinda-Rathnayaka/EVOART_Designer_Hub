const express = require('express');
const router = express.Router();
const {
  submitBid,
  updateBid,
  getMyBids,
  getProjectBids,
  getBidById,
} = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Designer: submit bid
router.post('/', authorize('designer'), submitBid);

// Designer: view my bids
router.get('/my-bids', authorize('designer'), getMyBids);

// Admin: view all bids for a project
router.get('/project/:projectId', authorize('admin'), getProjectBids);

// Designer or Admin: view a specific bid (guarded by ownership check)
router.get('/:id', getBidById);

// Designer: update bid while bidding is open
router.put('/:id', authorize('designer'), updateBid);

module.exports = router;
