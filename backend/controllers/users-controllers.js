const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
//use let to allow us to delete the palce
let DUMMY_USERS = [
	{
		id: 'u1',
		name: 'Adam badran',
		email: 'adam@gmail.com',
		passowrd: 'testers'
	}
];

const getUsers = (req, res, next) => {
	res.json({ users: DUMMY_USERS });
};

const signup = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		throw new HttpError('Invalid inputs passed, please check your data', 422);
	}
	const { name, email, password } = req.body;
	//make sure not able to create a user which we already have
	//so an email address should not be registered more than once
	const hasUser = DUMMY_USERS.find((u) => u.email === email);
	if (hasUser) {
		throw new HttpError('Could not create user , email already exists', 422); //422 invalid user  input
	}
	const createUser = {
		id: uuidv4(),
		name,
		email,
		password
	};
	DUMMY_USERS.push(createUser);
	res.status(201).json({ user: createUser });
};

const login = (req, res, next) => {
	const { email, password } = req.body;
	const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
	if (!identifiedUser || identifiedUser.password !== password) {
		throw new HttpError('Could not identify user, credentials seem to be wrong', 401); //401 means authentication failed
	}
	res.json({ message: 'logged in' });
};
exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
