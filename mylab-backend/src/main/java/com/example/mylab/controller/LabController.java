package com.example.mylab.controller;

import com.example.mylab.dto.LabDTO;
import com.example.mylab.service.LabService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/labs")
@CrossOrigin(origins = "*")
public class LabController {

    @Autowired
    private LabService labService;

    @GetMapping
    public ResponseEntity<List<LabDTO>> getAllLabs(@RequestParam(required = false) String department) {
        if (department != null && !department.isEmpty()) {
            return ResponseEntity.ok(labService.getLabsByDepartment(department));
        }
        return ResponseEntity.ok(labService.getAllLabs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabDTO> getLabById(@PathVariable Long id) {
        return ResponseEntity.ok(labService.getLabById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LabDTO> createLab(@RequestBody LabDTO labDTO) {
        return ResponseEntity.ok(labService.createLab(labDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LabDTO> updateLab(@PathVariable Long id, @RequestBody LabDTO labDTO) {
        return ResponseEntity.ok(labService.updateLab(id, labDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLab(@PathVariable Long id) {
        labService.deleteLab(id);
        return ResponseEntity.ok().build();
    }
}
