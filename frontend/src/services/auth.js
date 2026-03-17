import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API = `${BASE}/api/auth`;

export const loginUser = (data) => axios.post(`${API}/login`, data);

export const registerUser = (data) => axios.post(`${API}/register`, data);
