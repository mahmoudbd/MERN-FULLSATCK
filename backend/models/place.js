const mongoose = require('mongoose');

// create a schema constant which access this schema method
const Schema = mongoose.Schema;

const placeSchema = new Schema({
	// this object contain our blueprint

	// required means the title must not be empty
	title: { type: String, required: true },
	description: { type: String, required: true },
	//image always shuold be as URL store in the database it will be more fast, not stored it in the database as files
	image: { type: String, required: true },
	address: { type: String, required: true },
	location: {
		lat: { type: Number, required: true },
		lng: { type: Number, required: true }
	},
	//make realtion or connection to user object and here we wnat this creator become a real creator in a mongoDB ID
	// and to tell the mongoDB we used type: mongoose.Types.ObjectId

	//ref property which allows to us to establish a connection between our current schema
	//and another schema  user schema
	creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

//special method available here in mongoose
//and model the return a constructor function and we have to add to arguments in this function
//the first is the name of the model 'Place'P must be capital, and the second is our schema
module.exports = mongoose.model('Place', placeSchema);
