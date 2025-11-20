import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
});

// do NOT define axios instance if you said not to; but here it's minimal. If you prefer, call fetch directly.
export default API;
