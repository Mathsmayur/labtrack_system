package com.example.mylab.service;

import com.example.mylab.dto.AnalyticsDTO;
import com.example.mylab.dto.PCDTO;
import com.example.mylab.model.PC;
import com.example.mylab.repository.ComplaintRepository;
import com.example.mylab.service.PCService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private PCService pcService;

    public AnalyticsDTO getAnalytics() {
        AnalyticsDTO analytics = new AnalyticsDTO();

        // Most problematic PCs
        List<Object[]> problematicPCs = complaintRepository.findMostProblematicPCs();
        List<Map<String, Object>> pcList = new ArrayList<>();
        for (Object[] result : problematicPCs) {
            PC pc = (PC) result[0];
            Long count = (Long) result[1];
            Map<String, Object> pcMap = new HashMap<>();
            pcMap.put("pc", pcService.convertToDTO(pc));
            pcMap.put("complaintCount", count);
            pcList.add(pcMap);
        }
        analytics.setMostProblematicPCs(pcList);

        // Most common problems
        List<Object[]> commonProblems = complaintRepository.findMostCommonProblems();
        List<Map<String, Object>> problemList = new ArrayList<>();
        for (Object[] result : commonProblems) {
            Map<String, Object> problemMap = new HashMap<>();
            problemMap.put("problemType", result[0]);
            problemMap.put("count", result[1]);
            problemList.add(problemMap);
        }
        analytics.setMostCommonProblems(problemList);

        // Weekly complaint count
        LocalDateTime weekStart = LocalDateTime.now().minusWeeks(1);
        analytics.setWeeklyComplaintCount(complaintRepository.countByDateRange(weekStart, LocalDateTime.now()));

        // Monthly complaint count
        LocalDateTime monthStart = LocalDateTime.now().minusMonths(1);
        analytics.setMonthlyComplaintCount(complaintRepository.countByDateRange(monthStart, LocalDateTime.now()));

        // Average repair time
        Double avgTime = complaintRepository.findAverageRepairTime();
        analytics.setAverageRepairTime(avgTime != null ? avgTime : 0.0);

        return analytics;
    }
}
