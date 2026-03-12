package com.example.mylab.service;

import com.example.mylab.dto.LabScheduleDTO;
import com.example.mylab.dto.LabStatusDTO;
import com.example.mylab.model.Lab;
import com.example.mylab.model.LabSchedule;
import com.example.mylab.repository.LabRepository;
import com.example.mylab.repository.LabScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LabScheduleService {

    @Autowired
    private LabScheduleRepository labScheduleRepository;

    @Autowired
    private LabRepository labRepository;

    public List<LabScheduleDTO> getSchedulesByLab(Long labId) {
        return labScheduleRepository.findByLabId(labId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LabScheduleDTO> getAllSchedules() {
        return labScheduleRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public LabScheduleDTO createSchedule(LabScheduleDTO dto) {
        Lab lab = labRepository.findById(dto.getLabId())
                .orElseThrow(() -> new RuntimeException("Lab not found"));

        LabSchedule schedule = new LabSchedule();
        schedule.setLab(lab);
        schedule.setDayOfWeek(dto.getDayOfWeek().toUpperCase());
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());
        schedule.setSubject(dto.getSubject());
        schedule.setProfessorName(dto.getProfessorName());

        return convertToDTO(labScheduleRepository.save(schedule));
    }

    public List<com.example.mylab.dto.LabDTO> getFreeLabs(String dayOfWeek, LocalTime startTime, LocalTime endTime) {
        List<Lab> allLabs = labRepository.findAll();
        List<LabSchedule> allSchedules = labScheduleRepository.findByDayOfWeek(dayOfWeek.toUpperCase());

        return allLabs.stream()
                .filter(lab -> allSchedules.stream()
                        .noneMatch(s -> s.getLab().getId().equals(lab.getId()) &&
                                s.getStartTime().isBefore(endTime) && s.getEndTime().isAfter(startTime)))
                .map(lab -> new com.example.mylab.dto.LabDTO(lab.getId(), lab.getName(), lab.getDepartment()))
                .collect(Collectors.toList());
    }

    public void deleteSchedule(Long id) {
        labScheduleRepository.deleteById(id);
    }

    public LabStatusDTO getLabStatus(Long labId) {
        Lab lab = labRepository.findById(labId)
                .orElseThrow(() -> new RuntimeException("Lab not found"));

        List<LabSchedule> schedules = labScheduleRepository.findByLabId(labId);
        LocalDateTime now = LocalDateTime.now();
        String currentDay = now.getDayOfWeek().name();
        LocalTime currentTime = now.toLocalTime();

        LabStatusDTO status = new LabStatusDTO();
        status.setLabId(labId);
        status.setLabName(lab.getName());

        // 1. Current Status
        Optional<LabSchedule> current = schedules.stream()
                .filter(s -> s.getDayOfWeek().equalsIgnoreCase(currentDay))
                .filter(s -> !currentTime.isBefore(s.getStartTime()) && currentTime.isBefore(s.getEndTime()))
                .findFirst();

        if (current.isPresent()) {
            status.setCurrentStatus("Occupied");
            status.setCurrentSubject(current.get().getSubject());
        } else {
            status.setCurrentStatus("Unoccupied");
        }

        // 2. Next Occupied
        // This is simplified: looks for next in the week
        status.setNextOccupied(calculateNextOccupied(schedules, now));

        // 3. Last Occupied
        status.setLastOccupied(calculateLastOccupied(schedules, now));

        return status;
    }

    private String calculateNextOccupied(List<LabSchedule> schedules, LocalDateTime now) {
        if (schedules.isEmpty()) return "No upcoming sessions";

        // Sort schedules by day of week and start time
        // This logic needs to handle wrap-around to next week
        // For simplicity, we'll just find the next one in chronological order from now
        
        LabSchedule next = null;
        int minDaysDiff = 8;
        LocalTime minTimeDiff = LocalTime.MAX;

        for (LabSchedule s : schedules) {
            int dayIndex = DayOfWeek.valueOf(s.getDayOfWeek()).getValue(); // 1-7
            int currentDayIndex = now.getDayOfWeek().getValue();
            
            int daysDiff = (dayIndex - currentDayIndex + 7) % 7;
            
            if (daysDiff == 0) {
                if (s.getStartTime().isAfter(now.toLocalTime())) {
                    // Later today
                    if (next == null || daysDiff < minDaysDiff || (daysDiff == minDaysDiff && s.getStartTime().isBefore(next.getStartTime()))) {
                        next = s;
                        minDaysDiff = daysDiff;
                    }
                } else {
                    // Earlier today, belongs to next week
                    daysDiff = 7;
                }
            }
            
            if (daysDiff > 0 && daysDiff < 8) {
                 if (next == null || daysDiff < minDaysDiff || (daysDiff == minDaysDiff && s.getStartTime().isBefore(next.getStartTime()))) {
                    next = s;
                    minDaysDiff = daysDiff;
                }
            }
        }

        if (next == null) return "No upcoming sessions";
        
        String dayDesc = minDaysDiff == 0 ? "Today" : (minDaysDiff == 1 ? "Tomorrow" : next.getDayOfWeek());
        return String.format("%s, %s - %s (%s)", dayDesc, next.getStartTime(), next.getEndTime(), next.getSubject());
    }

    private String calculateLastOccupied(List<LabSchedule> schedules, LocalDateTime now) {
        if (schedules.isEmpty()) return "Never occupied";
        
        // Find the most recent session in the past
        LabSchedule last = null;
        int minDaysDiff = 8;

        for (LabSchedule s : schedules) {
            int dayIndex = DayOfWeek.valueOf(s.getDayOfWeek()).getValue();
            int currentDayIndex = now.getDayOfWeek().getValue();
            
            int daysDiff = (currentDayIndex - dayIndex + 7) % 7;
            
            if (daysDiff == 0) {
                if (s.getEndTime().isBefore(now.toLocalTime())) {
                    // Earlier today
                     if (last == null || daysDiff < minDaysDiff || (daysDiff == minDaysDiff && s.getEndTime().isAfter(last.getEndTime()))) {
                        last = s;
                        minDaysDiff = daysDiff;
                    }
                } else {
                    // Later today or currently ongoing, belongs to last week
                    daysDiff = 7;
                }
            }
            
            if (daysDiff > 0 && daysDiff < 8) {
                if (last == null || daysDiff < minDaysDiff || (daysDiff == minDaysDiff && s.getEndTime().isAfter(last.getEndTime()))) {
                    last = s;
                    minDaysDiff = daysDiff;
                }
            }
        }

        if (last == null) return "Unknown";
        
        String dayDesc = minDaysDiff == 0 ? "Today" : (minDaysDiff == 1 ? "Yesterday" : last.getDayOfWeek());
        return String.format("%s, %s - %s (%s)", dayDesc, last.getStartTime(), last.getEndTime(), last.getSubject());
    }

    private LabScheduleDTO convertToDTO(LabSchedule schedule) {
        return new LabScheduleDTO(
                schedule.getId(),
                schedule.getLab().getId(),
                schedule.getLab().getName(),
                schedule.getDayOfWeek(),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getSubject(),
                schedule.getProfessorName()
        );
    }
}
