const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');
//use let to allow us to delete the palce
let DUMMY_USERS = [
	{
		id: 'u1',
		name: 'Adam badran',
		email: 'adam@gmail.com',
		password: 'testers'
	}
];

const getUsers = async (req, res, next) => {
	let users;
	try {
		//diffrenet properties namely the name and email with out password
		//we can ({}, 'name email') or ({}, '-password')
		users = await User.find({}, '-password');
	} catch (err) {
		const error = new HttpError('Fetching users failed please try again later', 500);
		return next(error);
	}
	//users.map because find which runs an array so we can not convert it into a default javasecript object
	res.json({ users: users.map((user) => user.toObject({ getters: true })) });
	//res.json({ users: DUMMY_USERS });
};

const signup = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(new HttpError('Invalid inputs passed, please check your data', 422)); //422 invalid user  input
	}
	const { name, email, password } = req.body;
	//find user
	let existingUser;
	try {
		//FindOne simply finds one decument matching the criteria in the argument of our method like forexamble here {email}
		//so with that we can easily check if the email of user exists already
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError('Signing up failed, please try again later', 500); //500 anything goes wrong with the request
		return next(error);
	}
	if (existingUser) {
		const error = new HttpError('User exists already,please login insted', 422); //422 invalid user  input
		return next(error);
	}

	//make sure not able to create a user which we already have
	//so an email address should not be registered more than once
	// const hasUser = DUMMY_USERS.find((u) => u.email === email);
	// if (hasUser) {
	// 	throw new HttpError('Could not create user , email already exists', 422); //422 invalid user  input
	// }

	const createdUser = new User({
		name,
		email,
		image: 'https://live.staticflickr.com/7631/26849088292_36fc52ee90_b.jpg',
		password,
		//coz the starting value for the places will be an empty array
		places: []
	});

	try {
		await createdUser.save();
	} catch (err) {
		const error = new HttpError('Signing up failed,please try again', 500); //500 anything goes wrong with the request
		return next(error);
	}
	//res.status(201).json({ place: createdUser }); //200 is normal success code but 201 status code if you created something new

	// id: uuidv4(),
	// name,
	// email,
	// password
	//DUMMY_USERS.push(createUser);

	res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
	const { email, password } = req.body;
	let existingUser;
	try {
		//FindOne simply finds one decument matching the criteria in the argument of our method like forexamble here {email}
		//so with that we can easily check if the email of user exists already
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError('Logging in failed, please try again later', 500); //500 anything goes wrong with the request
		return next(error);
	}
	//if existing user is not stored in the database or if the existing user password
	// not equal to the password that was entered
	if (!existingUser || existingUser.password !== password) {
		const error = new HttpError('Invalid credentials, could not log you in', 401);
		return next(error);
	}

	// const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
	// if (!identifiedUser || identifiedUser.password !== password) {
	// 	throw new HttpError('Could not identify user, credentials seem to be wrong', 401); //401 means authentication failed
	// }
	res.json({ message: 'logged in' });
};
exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
