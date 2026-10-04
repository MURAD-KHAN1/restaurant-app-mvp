const router = require('express').Router();
const controller = require('../controllers/menuController');
router.route('/').get(controller.getMenuItems).post(controller.createMenuItem);
router.route('/:id').get(controller.getMenuItemById).put(controller.updateMenuItem).delete(controller.deleteMenuItem);
module.exports = router;
