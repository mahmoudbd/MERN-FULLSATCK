const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
//import user model coz we want to interact with the user well we kind of have to establish that connection
//so now we can use user schema
const User = require('../models/user');

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
	//let places;

	//use populate method
	let userWithPlaces;
	try {
		//find method in mongoose  here will return all places so we have to add the user id here as argument and refer to placeID
		userWithPlaces = await User.findById(userId).populate('places');
	} catch (err) {
		const error = new HttpError('Fetching places failed, please try again later ', 500); //500 anything goes wrong with the request
		return next(error);
	}
	//DUMMY_PLACES.filter((p) => {
	// 	return p.creator === userId;

	if (!userWithPlaces || userWithPlaces.places.length === 0) {
		//return res.status(404).json({ message: 'Could not find a place for the provided user id.' });
		// const error = new Error('Could not find a place for the provided user id');
		// error.code = 404;

		// we use next here to forward it to the next middleware in line
		// we must do not forget return to make sure this code does not run
		return next(new HttpError('Could not find a places for the provided user id', 404));
	}
	//we used here map because find returns an array here and we can not use toObject in array
	res.json({ places: userWithPlaces.places.map((place) => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
	//this function will look into this requestobject and see if there are any validation errors
	//which were detected based on our setup in the check function
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors);
		next(new HttpError('Invalid inputs passed, please check your data', 422)); //422 invalid user  input
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
		image: req.file.path,
		//we now store a real Mongo DB ID in this field
		creator
	});

	let user;
	try {
		//we wnat to access degrade the property of the users and check whether the ID we have for our log in user is already stored in here
		//so we wnat to check if the ID of the user is existing
		user = await User.findById(creator);
	} catch (err) {
		const error = new HttpError('Creating place failed,please try again', 500);
		return next(error);
	}
	//if the user is not existing  not in our database
	if (!user) {
		const error = new HttpError('Could not find user for provided id', 404);
		return next(error);
	}
	console.log(user);
	//if the user is existing first we create new document with our new place
	//and second we can add the place added to the user
	//DUMMY_PLACES.push(createdPlace); //unsheft
	try {
		//we need to be able to kind of execute different or multiple operation which are not directly realted to each other and if one of these operations fails
		//so if either creating the place fails or if storing the ID of the place in our user documents .
		//then we want to make sure to undo all operations

		//to do that we need to use transactions and sessions
		//transactions allows you to perform multiple operations in isolation of each other and to undo these and the transactions
		//are basically built on sessions
		const sess = await mongoose.startSession();
		sess.startTransaction();
		//tell mongoose what we want to do here
		//we wnat to make sure that our created place is saved right in the databease with a uniqu ID
		await createdPlace.save({ session: sess }); //add a place
		//here we need to make sure that the place ID is also added to our user
		//push here is not the standard push but here used by mongoose which kind of allows
		//mongoose to behind the scen establish the conncetion between the tow
		//models we are referring to here
		user.places.push(createdPlace); //add a place id
		//now we have to save our updated user
		await user.save({ session: sess }); //save the user
		//we wnat here to make sure that this session commits the trends action right here
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError('Creating place failed,please try again', 500); //500 anything goes wrong with the request
		return next(error);
	}
	res.status(201).json({ place: createdPlace }); //200 is normal success code but 201 status code if you created something new
};
const updatePlace = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(new HttpError('Invalid inputs passed, please check your data', 422)); //422 invalid user  input
	}
	const { title, description } = req.body;
	const placeId = req.params.pid;

	let place;
	try {
		place = await Place.findById(placeId);
	} catch (err) {
		const error = new HttpError('Something went wrong could not update place.', 500); //500 anything goes wrong with the request
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

const deletePlace = async (req, res, next) => {
	const placeId = req.params.pid;
	//find the place  the first step
	let place;
	try {
		//first we have to find the place ID of a place  we are looking for to delete this place
		//and in the same time we also want to search for our users collection and see which user has this place.
		//and then we want to make sure that if we did a place that this ID is also deleted from this user document
		//this means we need to access to user document and need overwrite or change an existing while infomation in this document
		//and to do that we need populate method and it needs information about the document where we want
		//to change something and move in this document we need to refer to aspecific property here is creator.
		//coz creator contains the user ID mongoose
		place = await Place.findById(placeId).populate('creator');
	} catch (err) {
		const error = new HttpError('Something went wrong, could not delete place.', 500);
		return next(error);
	}
	//check whether a place ID actually exists
	if (!place) {
		const error = new HttpError('Could not find place for this id.', 404);
		return next(error);
	}
	// if you wont to clen up the images folder of the places
	//continue cods with fs.unlink
	const imagePath = place.image;
	// delete it from our database
	try {
		//make sure that we can delete the place
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await place.remove({ session: sess });
		place.creator.places.pull(place); //pull will automatically remove the ID
		await place.creator.save({ session: sess });
		await sess.commitTransaction();
		//await place.remove();
	} catch (err) {
		const error = new HttpError('Something went wrong, could not delete place.', 500);
		return next(error);
	}
	fs.unlink(imagePath, (err) => {
		console.log(err);
	});
	res.status(201).json({ message: 'Deleted place' });
	// if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
	// 	throw new HttpError('Clould not find a place for that id .', 404);
	// }
	// //keep the place if IDs do not match , if IDs do match then
	// //it is the place i want to remove
	// DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
};
//we use a post man that allow us to test or send a requestes becaues if you enter something in the
//browser URL it by default always is a GET request

//exports one element

exports.getPlaceId = getPlaceId;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

//.save is a method available in mongoose and save will handle all mongoDB code we need to
//store a new document in our database in the colliction and
//additionally save will also create that unique places IDs and it also promis
