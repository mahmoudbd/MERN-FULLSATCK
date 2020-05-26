const express = require('express');

//ensures the request bodies of incoming requests
const bodyPareser = require('body-parser');
const placesRoutes = require('./routes/places-routes');
const app = express();

//use router as middleware
app.use('/api/places', placesRoutes);

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
const port = 5000;

app.listen(port, console.log(`serevr running on port ${port}`));
