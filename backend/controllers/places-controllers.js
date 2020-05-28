const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const getCoordsForAddress = require('../util/location');
//use let to allow us to delete the palce
let DUMMY_PLACES = [
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

const getPlacesByUserId = (req, res, next) => {
	const userId = req.params.uid;
	//we dont use a find that give us the first place matches we want to
	//use filter because filter will return a new array full of elements that fulfill this criteria
	const places = DUMMY_PLACES.filter((p) => {
		return p.creator === userId;
	});
	if (!places || places.length === 0) {
		//return res.status(404).json({ message: 'Could not find a place for the provided user id.' });
		// const error = new Error('Could not find a place for the provided user id');
		// error.code = 404;

		// we use next here to forward it to the next middleware in line
		// we must do not forget return to make sure this code does not run
		return next(new HttpError('Could not find a places for the provided user id', 404));
	}

	res.json({ places });
};

const createPlace = async (req, res, next) => {
	//this function will look into this requestobject and see if there are any validation errors
	//which were detected based on our setup in the check function
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors);
		next(new HttpError('Invalid inputs passed, please check your data', 422));
	}
	//get the parse body on a request body property
	//we will use oject destructuring to get different properties out of requset body and store it in
	//const wich are then available in the function // destructuring just short  cut for const title = title.req.body
	const { title, description, address, creator } = req.body;
	let coordinates;
	try {
		coordinates = await getCoordsForAddress(address);
	} catch (error) {
		return next(error);
	}
	const createdPlace = {
		id: uuidv4(),
		title,
		description,
		location: coordinates,
		address,
		creator
	};
	DUMMY_PLACES.push(createdPlace); //unsheft
	res.status(201).json({ place: createdPlace }); //200 is normal success code but 201 status code if you created something new
};
const updatePlace = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		throw new HttpError('Invalid inputs passed, please check your data', 422);
	}
	const { title, description } = req.body;
	const placeId = req.params.pid;
	//we used a copy of our object data ,a spread operator  here becaues if we use direct
	//updateplace.title= title that will immediately change the DUMMY_PLACES array above
	//becaus objects are refernce value in java script , so if we would also store a file
	//this data might have already changed
	//so we want to create copy for place object then change that copy and
	//only once that copy is finshed we want change the entrie place in this array
	//of places with that updated copy
	const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
	//this returns us the index of the place istead of the place itself
	const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
	updatedPlace.title = title;
	updatedPlace.description = description;

	DUMMY_PLACES[placeIndex] = updatedPlace;

	res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
	const placeId = req.params.pid;

	if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
		throw new HttpError('Clould not find a place for that id .', 404);
	}
	//keep the place if IDs do not match , if IDs do match then
	//it is the place i want to remove
	DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
	res.status(201).json({ message: 'Deleted place' });
};
//we use a post man that allow us to test or send a requestes becaues if you enter something in the
//browser URL it by default always is a GET request

//exports one element

exports.getPlaceId = getPlaceId;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
