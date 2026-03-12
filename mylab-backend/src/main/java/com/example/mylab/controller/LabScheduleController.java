package com.example.mylab.controller;

import com.example.mylab.dto.LabDTO;
import com.example.mylab.dto.LabScheduleDTO;
import com.example.mylab.dto.LabStatusDTO;
import com.example.mylab.service.LabScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = "*")
public class LabScheduleController {

    @Autowired
    private LabScheduleService labScheduleService;

    @GetMapping("/lab/{labId}")
    public ResponseEntity<List<LabScheduleDTO>> getSchedulesByLab(@PathVariable Long labId) {
        return ResponseEntity.ok(labScheduleService.getSchedulesByLab(labId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<LabScheduleDTO>> getAllSchedules() {
        return ResponseEntity.ok(labScheduleService.getAllSchedules());
    }

    @GetMapping("/free-labs")
    public ResponseEntity<List<LabDTO>> getFreeLabs(
            @RequestParam String dayOfWeek,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime) {
        return ResponseEntity.ok(labScheduleService.getFreeLabs(dayOfWeek, startTime, endTime));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LabScheduleDTO> createSchedule(@RequestBody LabScheduleDTO dto) {
        return ResponseEntity.ok(labScheduleService.createSchedule(dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        labScheduleService.deleteSchedule(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status/{labId}")
    public ResponseEntity<LabStatusDTO> getLabStatus(@PathVariable Long labId) {
        return ResponseEntity.ok(labScheduleService.getLabStatus(labId));
    }
}
