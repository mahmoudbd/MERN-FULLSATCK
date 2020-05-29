const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const HttpError = require('./models/http-error');
//ensures the request bodies of incoming requests
const bodyPareser = require('body-parser');
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const app = express();

//new middleware to use body-paresr package it should before the request reaches the places routes
//because the middleware will be parsed from top to bottom
//so we have to first parse the body and then reach the routes

//this will parse any incoming requests body and extract any json data
//to regular java script data structurs like opjects and aarays and then call next automatically
app.use(bodyPareser.json());
//use router as middleware
app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);
//this comes after our routes
//this middleware only runs if we didnt send the response in one of our routes before
//only reached if we have some requests wich didnt get a response
app.use((req, res, next) => {
	const error = new HttpError('Could not find this routes', 404);
	throw error;
});
//if you provid a middleware function that takes four parameters express will recognize this
//and make this as a special middelware functio as an error handling function
//That means this fun will only be executed on requests that have an error
//so this function will execute if any middleware in front of it has an error
app.use((error, req, res, next) => {
	//setup some default error handling code
	// First we should check if response headers sent is true response has been sent
	if (res.headerSent) {
		//return next and forward the error  this property helps us to check if a response and the header
		return next(error);
	}
	//if not response has been sent yet we will send 500 code something went wrong on the server
	res.status(error.code || 500);
	res.json({ message: error.message || 'An unknown error occurred!' });
});
dotenv.config();
mongoose
	.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, () => console.log('conected to db '))
	.then(() => {
		app.listen(5000);
	})
	.catch((err) => {
		console.log(err);
	});
