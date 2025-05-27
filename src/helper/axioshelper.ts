import axios from 'axios';
export const httpaxios = axios.create({
    baseURL: process.env.BASE_URL,
});