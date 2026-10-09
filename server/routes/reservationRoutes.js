const router = require('express').Router();
const { protect, managerOnly, customerOnly } = require('../middleware/auth');
const controller = require('../controllers/reservationController');
router.post('/', protect, customerOnly, controller.createReservation);
router.get('/my', protect, customerOnly, controller.getMyReservations);
router.get('/', protect, managerOnly, controller.getReservations);
// Managers accept/decline; an authenticated owner may only cancel their own booking.
router.patch('/:id', protect, controller.updateReservation);
module.exports = router;
