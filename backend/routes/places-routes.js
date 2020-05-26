const express = require('express');

//Routing means that listen for certain HTTP path combinations and then run different code for every combination
const router = express.Router();

const DUMMY_PLACES = [
	{
		id: 'p1',
		title: 'Empire State Building',
		description: 'One of the most famous sky scrapers in the world!',
		location: {
			lat: 40.7484474,
			lng: -73.9871516
		},
		address: '20 W 34th St, New York, NY 10001',
		creator: 'u1'
	}
];
//routing gives us a special object that we can register middleware wich is filterd by HTTP method in path and then we can export our
//configured router by the end of this this file
//:pid dynamic segment  we use :
router.get('/:pid', (req, res, next) => {
	//using the rquest object and then params property that will holds an object where
	//your dynamic segments and exist as keys and then concerte value the user who sent the request enterd {pid:'p1'}
	const placeId = req.params.pid;
	const place = DUMMY_PLACES.find((p) => {
		//return true if true
		return p.id === placeId;
	});
	//Error handeling
	//use HTTP code 404 not found and then return insted of else  and after return no other code executes
	if (!place) {
		//return res.status(404).json({ message: 'Could not find a place for the provided id.' });

		//app.js in the error handling
		const error = new Error('Could not find a place for the provided id');
		error.code = 404;
		throw error;
	}
	//we will not send back a response with send
	//res.send();

	//send response with json data if we do not wont to send HTML file forexample
	//return place in our response
	res.json({ place }); // place = place:place
});

router.get('/user/:uid', (req, res, next) => {
	const userId = req.params.uid;
	const place = DUMMY_PLACES.find((p) => {
		return p.creator === userId;
	});
	if (!place) {
		//return res.status(404).json({ message: 'Could not find a place for the provided user id.' });
		const error = new Error('Could not find a place for the provided user id');
		error.code = 404;
		// we use next here to forward it to the next middleware in line
		// we must do not forget return to make sure this code does not run
		return next(error);
	}

	res.json({ place });
});
module.exports = router;
