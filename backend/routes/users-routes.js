const express = require('express');
const { check } = require('express-validator');
const usersControllers = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload');
const router = express.Router();

router.get('/', usersControllers.getUsers);

router.post(
	'/signup',
	//use multer middleware
	fileUpload.single('image'),
	//here use express-validator library
	[
		(check('name').not().isEmpty(),
		check('email').normalizeEmail().isEmail(),
		check('password').isLength({ min: 6 }))
	],
	usersControllers.signup
);
router.post('/login', usersControllers.login);

module.exports = router;
