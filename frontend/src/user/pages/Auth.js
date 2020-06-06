import React, { useState, useContext } from 'react';

import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './Auth.css';

const Auth = () => {
	const auth = useContext(AuthContext);
	// const [ isLoginMode, setIsLoginMode ] = useState(true);
	// const [ isLoading, setIsLoading ] = useState(false);

	const [ isLoginMode, setIsLoginMode ] = useState(true);
	//1- so now we need to call to really send the requset and this function
	//will returns some data so we will use object dstructuring
	const { isLoading, error, sendRequest, clearError } = useHttpClient();
	//	const [ error, setError ] = useState();

	const [ formState, inputHandler, setFormData ] = useForm(
		{
			email: {
				value: '',
				isValid: false
			},
			password: {
				value: '',
				isValid: false
			}
		},
		false
	);

	const switchModeHandler = () => {
		if (!isLoginMode) {
			setFormData(
				{
					...formState.inputs,
					name: undefined,
					image: undefined
				},
				formState.inputs.email.isValid && formState.inputs.password.isValid
			);
		} else {
			setFormData(
				{
					...formState.inputs,
					name: {
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
		}
		setIsLoginMode((prevMode) => !prevMode);
	};

	const authSubmitHandler = async (event) => {
		//we want here to send a HTTP requset to the loggin route and to the signup ruote
		event.preventDefault();
		console.log(formState.inputs);
		//login mode
		if (isLoginMode) {
			//setIsLoading(true);
			try {
				// login mode  send request only to login route in the  backend
				//istead of fetch then post as a second argument the third argument should be the body
				//and the forth argument our headers object this now send request
				const responseData = await sendRequest(
					`${process.env.REACT_APP_BACKEND_URL}/users/login`,
					'POST',
					JSON.stringify({
						email: formState.inputs.email.value,
						password: formState.inputs.password.value
					}),
					{
						//	headers: {
						//with out that our back will not Know which kind of daya it receive and the body-parsing  where parse the incoming json data will not kik in correctly
						'Content-Type': 'application/json'
					}
				);
				//convert our array or object to json then put inside it our keys that we are validating in the users routes and
				//in the users controller whene we create a new user in signup fuction we do extract this keys name email and password
				//body: JSON.stringify({
				//we having that from the use form hook wich manages our  different data pieces , when switch to login mode
				//  log in mode we only have email and password field.
				//and this values should be valid whene we reached only with submit button click
				//email: formState.inputs.email.value,
				//password: formState.inputs.password.value

				//setIsLoading(false);
				//this will only kick in once if all the steps before are done
				//now in the backend in users-controllers for login and signup and frontend can user object get ID
				auth.login(responseData.userId, responseData.token);
			} catch (err) {
				// console.log(err);
				// setIsLoading(false);
				// //update error state if try to creating a user with an exsting email
				// setError(err.message || 'Something went wrong, please try again');
			}
		} else {
			try {
				//we can only submit text data like email or {}or[]
				// for images that's different images are binary data so therefore we use formData which is already bulit into the browser and into JS
				const formData = new FormData();
				formData.append('email', formState.inputs.email.value); //here in .append you can add both data text data like email or binary data so files
				formData.append('name', formState.inputs.name.value);
				formData.append('password', formState.inputs.password.value);
				formData.append('image', formState.inputs.image.value);
				// signup mode  send request only to signup backend
				// we start first here coz we need to create at least one user with signup request and it should be post request
				//then we need to set certain headers
				const responseData = await sendRequest(
					`${process.env.REACT_APP_BACKEND_URL}/users/signup`,
					'POST',
					formData
				);
				// method: 'POST',
				// headers: {
				//with out that our back will not Know which kind of daya it receive and the body-parsing  where parse the incoming json data will not kik in correctly
				//'Content-Type': 'application/json'

				//convert our array or object to json then put inside it our keys that we are validating in the users routes and
				//in the users controller whene we create a new user in signup fuction we do extract this keys name email and password
				// body: JSON.stringify({
				// 	//we having that from the use form hook wich manages our  different data pieces , when switch to sign up mode
				// 	// we add a name field if we are in log mode we only have email and password field.
				// 	//and this values should be valid whene we reached only with submit button click
				// 	name: formState.inputs.name.value,
				// 	email: formState.inputs.email.value,
				// 	password: formState.inputs.password.value
				// })

				//parse the response body
				//const responseData = await response.json();
				//the ok property exists in the response object and it will be true if we have a 200 status code
				//so if we have 400 or 500 status  that means not ok
				// if (!response.ok) {
				// 	throw new Error(responseData.message);
				// }
				// setIsLoading(false);
				//this will only kick in once if all the steps before are doen
				auth.login(responseData.userId, responseData.token);
			} catch (err) {
				// console.log(err);
				// setIsLoading(false);
				// //update error state if try to creating a user with an exsting email
				// setError(err.message || 'Something went wrong, please try again');
			}
		}
	};
	//clear the error from onClear // User exists already,please login insted from users-controllrs //
	// or Invalid credentials, could not log you in if password was false in the login mode
	// const errorHandler = () => {
	// 	setError(null);
	// };
	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			<Card className="authentication">
				{isLoading && <LoadingSpinner asOverlay />}
				<h2>Login Required</h2>
				<hr />
				<form onSubmit={authSubmitHandler}>
					{!isLoginMode && (
						<Input
							element="input"
							id="name"
							type="text"
							label="Your Name"
							validators={[ VALIDATOR_REQUIRE() ]}
							errorText="Please enter a name."
							onInput={inputHandler}
						/>
					)}
					{/* show upload image button if we are in signup mode */}
					{!isLoginMode && (
						<ImageUpload center id="image" onInput={inputHandler} errorText="please provide an image." />
					)}
					<Input
						element="input"
						id="email"
						type="email"
						label="E-Mail"
						validators={[ VALIDATOR_EMAIL() ]}
						errorText="Please enter a valid email address."
						onInput={inputHandler}
					/>
					<Input
						element="input"
						id="password"
						type="password"
						label="Password"
						validators={[ VALIDATOR_MINLENGTH(6) ]}
						errorText="Please enter a valid password, at least 6 characters."
						onInput={inputHandler}
					/>
					<Button type="submit" disabled={!formState.isValid}>
						{isLoginMode ? 'LOGIN' : 'SIGNUP'}
					</Button>
				</form>
				<Button inverse onClick={switchModeHandler}>
					SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN'}
				</Button>
			</Card>
		</React.Fragment>
	);
};

export default Auth;
