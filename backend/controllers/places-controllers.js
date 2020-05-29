const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const getCoordsForAddress = require('../util/location');
//import monoose model , Capital P to be as constructor function
const Place = require('../models/place');
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

const getPlaceId = async (req, res, next) => {
	//using the rquest object and then params property that will holds an object where
	//your dynamic segments and exist as keys and then concerte value the user who sent the request enterd {pid:'p1'}
	const placeId = req.params.pid;
	let place;
	try {
		//findById mongoose method
		place = await Place.findById(placeId);
		//DUMMY_PLACES.find((p) => {
		// 	//return true if true
		// 	return p.id === placeId;
	} catch (err) {
		const error = new HttpError('Something went wrong Could not find a place', 500);
		return next(error);
	}

	//Error handeling
	//use HTTP code 404 not found and then return insted of else  and after return no other code executes
	if (!place) {
		//return res.status(404).json({ message: 'Could not find a place for the provided id.' });

		//app.js in the error handling
		// const error = new Error('Could not find a place for the provided id');
		// error.code = 404;
		// throw error;

		//start use http-error.js to send error message  it's nicer and shorter to handle erros
		const error = new HttpError('Could not find a place for the provided id', 404);
		return next(error);
	}
	//we will not send back a response with send
	//res.send();

	//send response with json data if we do not wont to send HTML file forexample
	//return place in our response

	//for mongoose , convert place to object and the second goal to get read  of underscore
	//by setting getters
	res.json({ place: place.toObject({ getters: true }) }); // place = place:place
};

const getPlacesByUserId = async (req, res, next) => {
	const userId = req.params.uid;
	//we dont use a find that give us the first place matches we want to
	//use filter because filter will return a new array full of elements that fulfill this criteria
	let places;
	try {
		//find method in mongoose  here will return all places so we have to add the user id here as argument and refer to placeID
		places = await Place.find({ creator: userId });
	} catch (err) {
		const error = new HttpError('Fetching places failed, please try again later ', 500); //500 anything goes wrong with the request
		return next(error);
	}
	//DUMMY_PLACES.filter((p) => {
	// 	return p.creator === userId;

	if (!places || places.length === 0) {
		//return res.status(404).json({ message: 'Could not find a place for the provided user id.' });
		// const error = new Error('Could not find a place for the provided user id');
		// error.code = 404;

		// we use next here to forward it to the next middleware in line
		// we must do not forget return to make sure this code does not run
		return next(new HttpError('Could not find a places for the provided user id', 404));
	}
	//we used here map because find returns an array here and we can not use toObject in array
	res.json({ places: places.map((place) => place.toObject({ getters: true })) });
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
	const createdPlace = new Place({
		//very important the properties in our model are the same in our schema
		title,
		description,
		address,
		location: coordinates,
		image:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/400px-Empire_State_Building_%28aerial_view%29.jpg',
		creator
	});
	//DUMMY_PLACES.push(createdPlace); //unsheft

	//.save is a method available in mongoose and save will handle all mongoDB code we need to
	//store a new document in our database in the colliction and
	//additionally save will also create that unique places IDs and it also promis
	try {
		await createdPlace.save();
	} catch (err) {
		const error = new HttpError('Creating place failed,please try again', 500);
		return next(error);
	}
	res.status(201).json({ place: createdPlace }); //200 is normal success code but 201 status code if you created something new
};
const updatePlace = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		throw new HttpError('Invalid inputs passed, please check your data', 422);
	}
	const { title, description } = req.body;
	const placeId = req.params.pid;

	let place;
	try {
		place = await Place.findById(placeId);
	} catch (err) {
		const error = new HttpError('Something went wrong could not update place.', 500);
		return next(error);
	}
	//we used a copy of our object data ,a spread operator  here becaues if we use direct
	//updateplace.title= title that will immediately change the DUMMY_PLACES array above
	//becaus objects are refernce value in java script , so if we would also store a file
	//this data might have already changed
	//so we want to create copy for place object then change that copy and
	//only once that copy is finshed we want change the entrie place in this array
	//of places with that updated copy
	//const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
	//this returns us the index of the place istead of the place itself
	//const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
	place.title = title;
	place.description = description;
	//DUMMY_PLACES[placeIndex] = updatedPlace;

	//sending back a response and to make sure that the update information is stored agin in our database
	try {
		await place.save();
	} catch (err) {
		const error = new HttpError('Something went wrong, could not update place.', 500);
		return next(error);
	}
	//convert mongoose object to normal java script object and get read of our underscore IDs
	res.status(200).json({ place: place.toObject({ getters: true }) });
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
