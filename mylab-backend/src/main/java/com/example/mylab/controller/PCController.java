package com.example.mylab.controller;

import com.example.mylab.dto.PCDTO;
import com.example.mylab.model.PCStatus;
import com.example.mylab.service.PCService;
import com.example.mylab.dto.BulkPCRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pcs")
@CrossOrigin(origins = "*")
public class PCController {

    @Autowired
    private PCService pcService;

    @GetMapping("/invalid-pc-types")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<com.example.mylab.dto.InvalidPcTypeDTO>> getInvalidPcTypePCs() {
        return ResponseEntity.ok(pcService.getPcsWithInvalidPcType());
    }

    @GetMapping("/lab/{labId}")
    public ResponseEntity<List<PCDTO>> getPCsByLab(
            @PathVariable Long labId,
            @RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty()) {
            PCStatus pcStatus = PCStatus.valueOf(status);
            return ResponseEntity.ok(pcService.getPCsByLabAndStatus(labId, pcStatus));
        }
        return ResponseEntity.ok(pcService.getPCsByLab(labId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PCDTO> getPCById(@PathVariable Long id) {
        return ResponseEntity.ok(pcService.getPCById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR', 'TECHNICIAN')")
    public ResponseEntity<PCDTO> createPC(@RequestBody PCDTO pcDTO) {
        return ResponseEntity.ok(pcService.createPC(pcDTO));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PCDTO>> createBulkPCs(@RequestBody BulkPCRequest request) {
        return ResponseEntity.ok(pcService.createBulkPCs(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR', 'TECHNICIAN')")
    public ResponseEntity<PCDTO> updatePC(@PathVariable Long id, @RequestBody PCDTO pcDTO) {
        return ResponseEntity.ok(pcService.updatePC(id, pcDTO));
    }

    @GetMapping("/unassigned")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ResponseEntity<List<PCDTO>> getUnassignedPCs() {
        return ResponseEntity.ok(pcService.getUnassignedPCs());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR', 'TECHNICIAN')")
    public ResponseEntity<Void> deletePC(@PathVariable Long id) {
        pcService.deletePC(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/invalid-pc-types/cleanup/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> cleanupPcTypeById(@PathVariable Long id) {
        pcService.cleanupPcTypeById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/invalid-pc-types/cleanup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Integer> cleanupAllInvalidPcTypes() {
        int updated = pcService.cleanupAllInvalidPcTypes();
        return ResponseEntity.ok(updated);
    }
}
