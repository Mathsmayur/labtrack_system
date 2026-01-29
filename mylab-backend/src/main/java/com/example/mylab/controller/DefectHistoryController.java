package com.example.mylab.controller;

import com.example.mylab.model.DefectHistory;
import com.example.mylab.service.DefectHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/defect-history")
@CrossOrigin(origins = "*")
public class DefectHistoryController {

    @Autowired
    private DefectHistoryService defectHistoryService;

    @GetMapping("/pc/{pcId}")
    public ResponseEntity<List<DefectHistory>> getDefectHistoryByPC(@PathVariable Long pcId) {
        return ResponseEntity.ok(defectHistoryService.getDefectHistoryByPC(pcId));
    }
}
