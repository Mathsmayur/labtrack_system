package com.example.mylab.repository;

import com.example.mylab.model.Lab;
import com.example.mylab.model.LabSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabScheduleRepository extends JpaRepository<LabSchedule, Long> {
    List<LabSchedule> findByLab(Lab lab);
    List<LabSchedule> findByLabId(Long labId);
    List<LabSchedule> findByDayOfWeek(String dayOfWeek);
}
