import axios from 'axios';
import { BASE_URI } from '../constants';

const instance = axios.create({
  baseURL: BASE_URI, timeout: 30000,
});

export default instance;
