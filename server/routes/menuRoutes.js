const router = require('express').Router();
const controller = require('../controllers/menuController');
const { protect, managerOnly } = require('../middleware/auth');
router.route('/').get(controller.getMenuItems).post(protect, managerOnly, controller.createMenuItem);
router.route('/:id').get(controller.getMenuItemById)
  .put(protect, managerOnly, controller.updateMenuItem)
  .delete(protect, managerOnly, controller.deleteMenuItem);
module.exports = router;
