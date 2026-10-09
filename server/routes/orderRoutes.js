const router = require('express').Router();
const { protect, managerOnly, customerOnly } = require('../middleware/auth');
const controller = require('../controllers/orderController');
router.post('/', protect, customerOnly, controller.createOrder);
router.get('/my', protect, customerOnly, controller.getMyOrders);
router.get('/', protect, managerOnly, controller.getOrders);
router.patch('/:id/status', protect, managerOnly, controller.updateOrderStatus);
module.exports = router;
