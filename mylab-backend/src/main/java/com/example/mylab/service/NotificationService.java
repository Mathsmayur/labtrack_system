package com.example.mylab.service;

import com.example.mylab.model.Notification;
import com.example.mylab.model.User;
import com.example.mylab.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification createNotification(User user, String message, String type) {
        Notification n = new Notification();
        n.setUser(user);
        n.setMessage(message);
        n.setType(type);
        n.setCreatedAt(LocalDateTime.now());
        n.setReadFlag(false);
        return notificationRepository.save(n);
    }

    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Notification markAsRead(Long id) {
        Notification n = notificationRepository.findById(id).orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setReadFlag(true);
        return notificationRepository.save(n);
    }

    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserAndReadFlagFalseOrderByCreatedAtDesc(user);
        for (Notification n : unread) {
            n.setReadFlag(true);
        }
        notificationRepository.saveAll(unread);
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndReadFlagFalse(user);
    }
}

