import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { setError } from '../state/reducers/chat';
import { BACKEND_API } from '../config/chatLogics';

export const instance = axios.create({
  baseURL: BACKEND_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generic GET
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
  setLoading?: (loading: boolean) => void,
  dispatch?: any,
): Promise<T | null> {
  try {
    dispatch(setError(''));
    setLoading?.(true);
    const response: AxiosResponse<T> = await instance.get(url, config);
    setLoading?.(false);
    return response.data;
  } catch (error: any) {
    setLoading?.(false);

    if (dispatch) {
      if (error.response) {
        dispatch(
          setError(error.response.data.message || 'Something went wrong.'),
        );
      } else if (error.request) {
        console.error('No response received:', error.request);
        dispatch(setError('Network error, please try again later.'));
      } else {
        console.error('Error:', error.message);
        dispatch(setError('An error occurred, please try again.'));
      }
    } else {
      console.error('API Error:', error);
      alert('Something went wrong.');
    }

    return null; // So the function always returns T or null
  }
}

// Generic POST
export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
  setLoading?: (loading: boolean) => void,
  dispatch?: any,
): Promise<T | null> {
  console.log('API POST URL:', url);
  try {
    dispatch(setError(''));
    setLoading?.(true);
    const response: AxiosResponse<T> = await instance.post(url, data, config);
    setLoading?.(false);
    return response.data;
  } catch (error: any) {
    setLoading?.(false);

    if (dispatch) {
      if (error.response) {
        dispatch(
          setError(error.response.data.message || 'Something went wrong.'),
        );
      } else if (error.request) {
        console.error('No response received:', error.request);
        dispatch(setError('Network error, please try again later.'));
      } else {
        console.error('Error:', error.message);
        dispatch(setError('An error occurred, please try again.'));
      }
    } else {
      console.error('API Error:', error);
      alert('Something went wrong.');
    }

    return null; // So the function always returns T or null
  }
}

// Generic PUT
export async function apiPut<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
  setLoading?: (loading: boolean) => void,
  dispatch?: any,
): Promise<T | null> {
  try {
    dispatch(setError(''));
    setLoading?.(true);
    const response: AxiosResponse<T> = await instance.put(url, data, config);
    setLoading?.(false);
    return response.data;
  } catch (error: any) {
    setLoading?.(false);

    if (dispatch) {
      if (error.response) {
        dispatch(
          setError(error.response.data.message || 'Something went wrong.'),
        );
      } else if (error.request) {
        console.error('No response received:', error.request);
        dispatch(setError('Network error, please try again later.'));
      } else {
        console.error('Error:', error.message);
        dispatch(setError('An error occurred, please try again.'));
      }
    } else {
      console.error('API Error:', error);
      alert('Something went wrong.');
    }

    return null;
  }
}

// Generic DELETE
export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig,
  setLoading?: (loading: boolean) => void,
  dispatch?: any,
): Promise<T | null> {
  try {
    dispatch(setError(''));
    setLoading?.(true);
    const response: AxiosResponse<T> = await instance.delete(url, config);
    setLoading?.(false);
    return response.data;
  } catch (error: any) {
    setLoading?.(false);

    if (dispatch) {
      if (error.response) {
        dispatch(
          setError(error.response.data.message || 'Something went wrong.'),
        );
      } else if (error.request) {
        console.error('No response received:', error.request);
        dispatch(setError('Network error, please try again later.'));
      } else {
        console.error('Error:', error.message);
        dispatch(setError('An error occurred, please try again.'));
      }
    } else {
      console.error('API Error:', error);
      alert('Something went wrong.');
    }

    return null;
  }
}
