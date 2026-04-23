import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCircle } from 'lucide-react';
import notificationService from '../services/notificationService';
import './NotificationBell.css';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // 30s auto-polling
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await notificationService.markAsRead(id);
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            fetchNotifications();
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('default', { 
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        });
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button className="notification-bell" onClick={() => setIsOpen(!isOpen)}>
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown slide-in">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
                                <CheckCircle size={14} /> Mark all read
                            </button>
                        )}
                    </div>
                    
                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="no-notifications">
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div 
                                    key={notif.id} 
                                    className={`notification-item ${!notif.readFlag ? 'unread' : 'read'}`}
                                    onClick={(e) => !notif.readFlag && handleMarkAsRead(notif.id, e)}
                                >
                                    <div className="notification-content">
                                        <p className="notification-message">{notif.message}</p>
                                        <span className="notification-time">{formatDate(notif.createdAt)}</span>
                                    </div>
                                    {!notif.readFlag && (
                                        <button 
                                            className="mark-read-btn" 
                                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                                            title="Mark as read"
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
