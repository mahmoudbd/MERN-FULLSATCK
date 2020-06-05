import { useState, useCallback, useRef, useEffect } from 'react';
//so let's create a custom http hook wich handles all this data passing response satus code checking
//and state managment logic so that we just have a function say
//wich we can call which then sends our requsets and then updating all state
//so we will create a function here will then do all that stuff we do manully in each component behind the
//senes for us then we need useState to manage the loading and error then the component can use our custom hook

//first this function should be named use somthing to fulfill the rull of hooks using use at the beginning
export const useHttpClient = () => {
	const [ isLoading, setIsLoading ] = useState(false);
	const [ error, setError ] = useState();

	const activeHttpRequests = useRef([]);
	//2- create function that should send the request
	//to configur this function we need a URL to send the requset then the request method then the requset data
	//here name it body and then the header object

	//6- we use a useCallback to be sure whene other component uses this hook never gets recreate this function
	const sendRequest = useCallback(async (url, method = 'GET', body = null, headers = {}) => {
		setIsLoading(true);
		const httpAbortCtrl = new AbortController();
		activeHttpRequests.current.push(httpAbortCtrl);
		try {
			//3- Now instead of send requset we can then call fetch and send it to a URL and pass this configuration{method,body etc}
			//method could be post also
			const response = await fetch(url, {
				method,
				body,
				headers,
				signal: httpAbortCtrl.signal
			});
			//parse the response body //check a response
			const responseData = await response.json();
			//filter our request controllers and remove the request controller which we used for this request
			activeHttpRequests.current = activeHttpRequests.current.filter((reqCtrl) => reqCtrl !== httpAbortCtrl);
			//the ok property exists in the response object and it will be true if we have a 200 status code
			//so if we have 400 or 500 status  that means not ok
			//4- so we can now here set the check response status code here , so now we doing our custom hook
			if (!response.ok) {
				throw new Error(responseData.message);
			}
			setIsLoading(false);
			//jsut return response data so that the component which uses our hook and uses this function can handle the data in that component
			return responseData;
			//if we got an error
		} catch (err) {
			setError(err.message);
			setIsLoading(false);
			//we should throw the error again so that component that uses our hook has a chance of knowing if somthing went wrong
			throw err;
		}
		//setIsLoading(false);
	}, []);
	const clearError = () => {
		setError(null);
	};
	useEffect(() => {
		//this return function is executed as a clean up function before the next time use effect runs again
		//or also whene the component that uses useEffect
		return () => {
			activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
		};
	}, []);
	//5- now this hook should return is loading and an error and send request so that the component where will use this hook has access to this information
	return { isLoading, error, sendRequest, clearError };
};
