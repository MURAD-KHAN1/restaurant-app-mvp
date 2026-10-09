const router = require('express').Router();
const { protect } = require('../middleware/auth');
router.get('/', protect, require('../controllers/reservationController').getTables);
module.exports = router;
