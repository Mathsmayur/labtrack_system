package com.example.mylab.controller;

import com.example.mylab.dto.ComplaintDTO;
import com.example.mylab.model.ComplaintStatus;
import com.example.mylab.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR', 'TECHNICIAN', 'STUDENT')")
    public ResponseEntity<ComplaintDTO> createComplaint(@RequestBody ComplaintDTO complaintDTO) {
        return ResponseEntity.ok(complaintService.createComplaint(complaintDTO));
    }

    @GetMapping("/pc/{pcId}")
    public ResponseEntity<List<ComplaintDTO>> getComplaintsByPC(@PathVariable Long pcId) {
        return ResponseEntity.ok(complaintService.getComplaintsByPC(pcId));
    }

    @GetMapping
    public ResponseEntity<List<ComplaintDTO>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ComplaintDTO> updateComplaintStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        ComplaintStatus status = ComplaintStatus.valueOf(request.get("status"));
        String remarks = request.get("remarks");
        return ResponseEntity.ok(complaintService.updateComplaintStatus(id, status, remarks));
    }
}
