import React, { useContext } from 'react';
//custom hook useHistory
import { useHistory } from 'react-router-dom';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import { VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH } from '../../shared/util/validators';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
//start handel image upload whene we add a new place in forntend
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import './PlaceForm.css';

const NewPlace = () => {
	const auth = useContext(AuthContext);
	const { isLoading, error, sendRequest, clearError } = useHttpClient();
	const [ formState, inputHandler ] = useForm(
		{
			title: {
				value: '',
				isValid: false
			},
			description: {
				value: '',
				isValid: false
			},
			address: {
				value: '',
				isValid: false
			},
			image: {
				value: null,
				isValid: false
			}
		},
		false
	);
	const history = useHistory();

	const placeSubmitHandler = async (event) => {
		event.preventDefault();
		try {
			const formData = new FormData();
			formData.append('title', formState.inputs.title.value);
			formData.append('description', formState.inputs.description.value);
			formData.append('address', formState.inputs.address.value);
			formData.append('image', formState.inputs.image.value);
			//our places-route to creating a new place
			await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places`, 'POST', formData, {
				Authorization: 'Bearer ' + auth.token
			});
			// JSON.stringify({
			// 	//from state inputs.title.value on this formState
			// 	title: formState.inputs.title.value,
			// 	description: formState.inputs.description.value,
			// 	address: formState.inputs.address.value,
			// 	//to managing the user ID as a global
			// 	creator: auth.userId
			// }),
			// { 'Content-Type': 'application/json' }

			//allow the users to go back after the navigatio
			history.push('/');
		} catch (err) {
			//we dont need to do anything here coz we did that in our Http custom hook
		}
		//console.log(formState.inputs); // send this to the backend!
	};

	return (
		//React.Fragment allow us to have multiple top level JSX elements
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			<form className="place-form" onSubmit={placeSubmitHandler}>
				{isLoading && <LoadingSpinner asOverlay />}
				<Input
					id="title"
					element="input"
					type="text"
					label="Title"
					validators={[ VALIDATOR_REQUIRE() ]}
					errorText="Please enter a valid title."
					onInput={inputHandler}
				/>
				<Input
					id="description"
					element="textarea"
					label="Description"
					validators={[ VALIDATOR_MINLENGTH(5) ]}
					errorText="Please enter a valid description (at least 5 characters)."
					onInput={inputHandler}
				/>
				<Input
					id="address"
					element="input"
					label="Address"
					validators={[ VALIDATOR_REQUIRE() ]}
					errorText="Please enter a valid address."
					onInput={inputHandler}
				/>
				<ImageUpload id="image" onInput={inputHandler} errorText="please provide an image." />
				<Button type="submit" disabled={!formState.isValid}>
					ADD PLACE
				</Button>
			</form>
		</React.Fragment>
	);
};

export default NewPlace;
