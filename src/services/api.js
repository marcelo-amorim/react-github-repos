import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.github.com',
  auth: {
    username: 'marcelo-amorim',
    password: 'Milla@2011',
  },
});

export default api;
