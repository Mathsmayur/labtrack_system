package com.example.mylab.repository;

import com.example.mylab.model.Notification;
import com.example.mylab.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    long countByUserAndReadFlagFalse(User user);
    List<Notification> findByUserAndReadFlagFalseOrderByCreatedAtDesc(User user);
}

