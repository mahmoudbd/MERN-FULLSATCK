const express = require('express');

const placesControllers = require('../controllers/places-controllers');

//Routing means that listen for certain HTTP path combinations and then run different code for every combination
const router = express.Router();

//routing gives us a special object that we can register middleware wich is filterd by HTTP method in path and then we can export our
//configured router by the end of this this file
//:pid dynamic segment  we use :
router.get('/:pid', placesControllers.getPlaceId /* use MVC structure  Model view controler => places-controllers.js*/);

router.get('/user/:uid', placesControllers.getPlaceByUserId);

router.post('/', placesControllers.createPlace);

module.exports = router;
