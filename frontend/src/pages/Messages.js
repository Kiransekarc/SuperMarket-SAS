import React, { useState, useEffect, useRef } from "react";
import { getAuthItem } from "../utils/authStorage";
import { getConversations, getMessages, sendMessage, markAsRead } from "../services/messageService";
import "./Messages.css";

const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [activeUser, setActiveUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const currentUserId = getAuthItem("id");
    const currentUserRole = getAuthItem("role");
    const currentUserName = getAuthItem("name");

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Fetch conversations list on load
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const data = await getConversations();
                setConversations(data);
                if (data.length > 0) {
                    // If staff, auto-select the first Admin in the list.
                    // If Admin, auto-select the first staff member to show something.
                    setActiveUser(data[0]);
                }
            } catch (error) {
                console.error("Error fetching conversations:", error);
            }
        };
        fetchConversations();
    }, []);

    // Fetch messages when active user changes
    useEffect(() => {
        if (activeUser) {
            fetchMessages(activeUser._id);
        }
    }, [activeUser]);

    // Removed auto-scroll to bottom - messages stay at top

    // Mark messages as read periodically if they are from the active user
    useEffect(() => {
        const markUnreadAsRead = async () => {
            const unreadMessages = messages.filter(
                (msg) => msg.receiver_id === currentUserId && msg.status === "unread"
            );
            for (const msg of unreadMessages) {
                try {
                    await markAsRead(msg._id);
                    // Update local state to show it's read so we don't call API again
                    setMessages((prev) =>
                        prev.map((m) => (m._id === msg._id ? { ...m, status: "read" } : m))
                    );
                } catch (err) {
                    console.error("Error marking as read", err);
                }
            }
        };
        if (messages.length > 0) {
            markUnreadAsRead();
        }
    }, [messages, currentUserId]);


    const fetchMessages = async (userId) => {
        setLoading(true);
        try {
            const data = await getMessages(userId);
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeUser) return;

        try {
            const sentMsg = await sendMessage(activeUser._id, newMessage);
            setMessages((prev) => [...prev, sentMsg]);
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const refreshMessages = () => {
        if (activeUser) {
            fetchMessages(activeUser._id);
        }
    };

    const clearChatHistory = async () => {
        if (!activeUser) return;
        
        if (window.confirm(`Are you sure you want to clear all messages with ${activeUser.name}?`)) {
            try {
                const token = getAuthItem("token");
                await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/messages/clear/${activeUser._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setMessages([]);
                alert('Chat history cleared successfully!');
            } catch (error) {
                console.error("Error clearing chat:", error);
                alert('Failed to clear chat history');
            }
        }
    };

    return (
        <div className="messages-page">
            <div className="messages-container">
                {/* Sidebar / Conversation List */}
                <div className="conversations-sidebar">
                    <div className="sidebar-header">
                        <h3>{currentUserRole === 'admin' ? 'Staff Members' : 'Admins'}</h3>
                    </div>
                    <ul className="conversation-list">
                        {conversations.map((user) => (
                            <li
                                key={user._id}
                                className={`conversation-item ${activeUser?._id === user._id ? "active" : ""}`}
                                onClick={() => setActiveUser(user)}
                            >
                                <div className="user-avatar">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="user-details">
                                    <span className="user-name">{user.name}</span>
                                    <span className="user-role">{user.role}</span>
                                </div>
                            </li>
                        ))}
                        {conversations.length === 0 && (
                            <li className="no-conversations">No contacts found.</li>
                        )}
                    </ul>
                </div>

                {/* Chat Area */}
                <div className="chat-area">
                    {activeUser ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-header-info">
                                    <div className="user-avatar active-chat-avatar">
                                        {activeUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3>{activeUser.name}</h3>
                                        <span className="chat-date">{new Date().toLocaleDateString([], {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="refresh-btn" onClick={refreshMessages} title="Refresh chat">
                                        <i className="fas fa-sync-alt"></i>
                                    </button>
                                    <button className="refresh-btn" onClick={clearChatHistory} title="Clear chat history">
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="messages-list">
                                {loading ? (
                                    <div className="loading-messages">Loading messages...</div>
                                ) : messages.length === 0 ? (
                                    <div className="no-messages">
                                        No messages yet. Start the conversation!
                                    </div>
                                ) : (
                                    messages.map((msg, index) => {
                                        // Extract sender information
                                        let senderIdStr = "";
                                        let senderName = "";
                                        let senderRole = "";
                                        
                                        if (msg.sender_id && typeof msg.sender_id === 'object') {
                                            senderIdStr = String(msg.sender_id._id);
                                            senderName = msg.sender_id.name || "Unknown";
                                            senderRole = msg.sender_id.role || "";
                                        } else if (msg.sender_id) {
                                            senderIdStr = String(msg.sender_id);
                                            senderName = "Unknown";
                                        }
                                        
                                        const isOwnMessage = senderIdStr === String(currentUserId);
                                        
                                        // Display name with role
                                        let displayName = senderName;
                                        if (senderRole) {
                                            displayName = `${senderName} (${senderRole.charAt(0).toUpperCase() + senderRole.slice(1)})`;
                                        }

                                        return (
                                            <div
                                                key={msg._id || index}
                                                className={`message-bubble-wrapper ${isOwnMessage ? "sent-wrapper" : "received-wrapper"}`}
                                            >
                                                <div className={`message-bubble ${isOwnMessage ? "sent" : "received"}`}>
                                                    <div className="message-sender-name">{displayName}</div>
                                                    <p>{msg.message_text}</p>
                                                    <div className="message-meta">
                                                        <span className="message-time">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                        {/* Show checkmarks for own messages */}
                                                        {isOwnMessage && (
                                                            <span className={`message-status ${msg.status}`}>
                                                                <i className={msg.status === "read" ? "fas fa-check-double" : "fas fa-check"}></i>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form className="message-input-area" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" disabled={!newMessage.trim()}>
                                    <i className="fas fa-paper-plane"></i>
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="empty-chat-area">
                            <i className="fas fa-comments chat-placeholder-icon"></i>
                            <h2>Select a conversation</h2>
                            <p>Choose a contact from the sidebar to view messages.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
