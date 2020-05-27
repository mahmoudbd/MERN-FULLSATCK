const HttpError = require('../models/http-error');
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

const getPlaceId = (req, res, next) => {
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
		// const error = new Error('Could not find a place for the provided id');
		// error.code = 404;
		// throw error;

		//start use http-error.js to send error message  it's nicer and shorter to handle erros
		throw new HttpError('Could not find a place for the provided id', 404);
	}
	//we will not send back a response with send
	//res.send();

	//send response with json data if we do not wont to send HTML file forexample
	//return place in our response
	res.json({ place }); // place = place:place
};

const getPlaceByUserId = (req, res, next) => {
	const userId = req.params.uid;
	const place = DUMMY_PLACES.find((p) => {
		return p.creator === userId;
	});
	if (!place) {
		//return res.status(404).json({ message: 'Could not find a place for the provided user id.' });
		// const error = new Error('Could not find a place for the provided user id');
		// error.code = 404;

		// we use next here to forward it to the next middleware in line
		// we must do not forget return to make sure this code does not run
		return next(new HttpError('Could not find a place for the provided user id', 404));
	}

	res.json({ place });
};

const createPlace = (req, res, next) => {
	//get the parse body on a request body property
	//we will use oject destructuring to get different properties out of requset body and store it in
	//const wich are then available in the function // destructuring just short  cut for const title = title.req.body
	const { title, description, coordinates, address, creator } = req.body;
	const createdPlace = {
		title,
		description,
		location: coordinates,
		address,
		creator
	};
};

//exports one element
exports.getPlaceId = getPlaceId;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;
