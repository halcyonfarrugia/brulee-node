const { get } = require('../controllers/contact-us/get');
const { create } = require('../controllers/contact-us/post');
const { verifyAdmin } = require('../middleware/token');

const router = require('express').Router();

// @route API_URL/query/
// @method POST
// @desc Create contact us query
// @perms All users
router.post('/', create);

// @route API_URL/query/
// @method GET
// @desc Get contact us queries
// @perms Admins only
router.get('/', verifyAdmin, get);


module.exports = router;