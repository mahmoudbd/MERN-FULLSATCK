const checkAuth = require('../middleware/check-auth');
const express = require('express');
//check is a method or function we can execute and it will return a new middleware
//configured for our validation requirements
const { check } = require('express-validator');
const placesControllers = require('../controllers/places-controllers');

const fileUpload = require('../middleware/file-upload');
//Routing means that listen for certain HTTP path combinations and then run different code for every combination
const router = express.Router();

//routing gives us a special object that we can register middleware wich is filterd by HTTP method in path and then we can export our
//configured router by the end of this file
//:pid dynamic segment  we use :
router.get('/:pid', placesControllers.getPlaceId /* use MVC structure  Model view controler => places-controllers.js*/);

router.get('/user/:uid', placesControllers.getPlacesByUserId);
// write a middleware here which checks an incomin requset for a valid token
//and if the token is invalid it will send back a response and it will block
//the request from  continuing to the other routes
//now any route after checkAuth are protected and can only be reached with a valid token
router.use(checkAuth);

router.post(
	'/',
	fileUpload.single('image'),
	[ check('title').not().isEmpty(), check('description').isLength({ min: 5 }), check('address').not().isEmpty() ],
	placesControllers.createPlace
);
router.patch(
	'/:pid',
	[ check('title').not().isEmpty(), check('description').isLength({ min: 5 }) ],
	placesControllers.updatePlace
);
router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
