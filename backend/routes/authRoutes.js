const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

console.log('REGISTER TYPE:', typeof register);
console.log('LOGIN TYPE:', typeof login);
module.exports = router;
