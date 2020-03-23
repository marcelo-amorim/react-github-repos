import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.github.com',
  auth: {
    username: 'username',
    password: 'password',
  },
});

export default api;
