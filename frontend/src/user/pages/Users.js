import React, { useEffect, useState } from 'react';

import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
const Users = () => {
	//use Http custom hook and then we can destructur object
	const { isLoading, error, sendRequest, clearError } = useHttpClient();
	// const [ isLoading, setIsLoading ] = useState(false);
	// const [ error, setError ] = useState();
	const [ loadedUsers, setLoadedUsers ] = useState(); //undefind
	// we would always send this request whenever the component re render
	// only once running whether we use useEffect
	//send requset with get method from users-controllers to return a list of users
	// with fetch we dont need to configure  get requset coz by default requset type of fetch is get
	//we alsoe dont want to add a content type header with get
	useEffect(
		() => {
			const fetchUsers = async () => {
				//setIsLoading(true);
				try {
					//instead of fetch use sendRequest from our custom hook
					//This needs URL nothing because it is configured as a default send a GET method
					//now we do our responseData from our hook
					const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL + '/users');
					//const responseData = await response.json();
					// if (!response.ok) {
					// 	throw new Error(responseData.message);
					// }
					// //we get back users key that will be an array of users from users-controllers so in our response should we have that users key
					setLoadedUsers(responseData.users);
				} catch (err) {
					//if we have an error we do not need anything here
					// setError(err.message);
				}
				//setIsLoading(false);
			};
			fetchUsers();
			//sendRequest is a dependency off useEffect
			//if we not wrapped in use callback it would be recreated whenever to hook reruns
			//useCallback around send request in our custom hook is super important
		},
		[ sendRequest ]
	);
	// const errorHandler = () => {
	// 	setError(null);
	//};

	return (
		//React,Fragment coz we wnt to have multiple to level JSX elements
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{/* output our loading spinner to have a full screen loading spinner */}
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
		</React.Fragment>
	);
};

export default Users;
