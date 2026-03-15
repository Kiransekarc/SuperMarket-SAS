import axios from 'axios';
import { getAuthItem } from '../utils/authStorage';

const API_URL = 'http://localhost:5000/api/messages';

const getHeaders = () => {
    const token = getAuthItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getConversations = async () => {
    const response = await axios.get(`${API_URL}/conversations`, getHeaders());
    return response.data;
};

export const getMessages = async (otherUserId) => {
    const response = await axios.get(`${API_URL}/${otherUserId}`, getHeaders());
    return response.data;
};

export const sendMessage = async (receiver_id, message_text) => {
    const response = await axios.post(
        API_URL,
        { receiver_id, message_text },
        getHeaders()
    );
    return response.data;
};

export const markAsRead = async (messageId) => {
    const response = await axios.put(`${API_URL}/${messageId}/read`, {}, getHeaders());
    return response.data;
};
