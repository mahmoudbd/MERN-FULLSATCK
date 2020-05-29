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
		lat: { type: Number, required: true }
	},
	creator: { type: String, required: true }
});

//special method available here in mongoose
//and model the return a constructor function and we have to add to arguments in this function
//the first is the name of the model 'Place'P must be capital, and the second is our schema
module.exports = mongoose.model('Place', placeSchema);
