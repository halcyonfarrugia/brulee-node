/* 

// Catering

PrismaDB collection
model Caterings {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  createdAt DateTime @default(now())
  description String
  phoneNumber String
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id])
  status    Boolean  @default(false)
  scheduledTime    DateTime
}

*/

const router = require('express').Router();
const { complete } = require('../controllers/catering/complete');
const { getCaterings } = require('../controllers/catering/get');
const { postCatering } = require('../controllers/catering/post');
const { verifyToken } = require('../middleware/token');

// @route API_URL/catering/
// @method POST
// @desc Create catering request
// @perms Registered Users
router.post('/', verifyToken, postCatering);

// @route API_URL/catering/
// @method GET
// @desc Get catering request
// @perms Registered Users
router.get('/', verifyToken, getCaterings);

// @route API_URL/catering/
// @method GET
// @desc Get catering request
// @perms Registered Users
router.post('/complete', verifyToken, complete);


module.exports = router;