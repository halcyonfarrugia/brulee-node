const { create } = require('../controllers/order/create');
const { verifyToken, verifyAdmin } = require('../middleware/token');
const { get } = require('../controllers/order/get');
const { view } = require('../controllers/order/view');
const { complete } = require('../controllers/order/complete');

const router = require('express').Router();

// @route API_URL/order/
// @method POST
// @desc Create order
// @perms Registered Users
router.post('/', verifyToken, create);

// @route API_URL/order?userId=""
// @method GET
// @desc Get all orders / get all orders from userId
// @perms User with the userId
router.get('/', verifyToken, get);

// @route API_URL/order/:orderId
// @method GET
// @desc Get order id
// @perms User with the order that has same userId or admin
router.get('/:orderId', verifyToken, view);

// @route API_URL/order/complete
// @method POST
// @desc Set order status to complete
// @perms Admin
router.post('/complete', verifyAdmin, complete);

module.exports = router;

