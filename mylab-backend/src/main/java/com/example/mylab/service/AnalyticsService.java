package com.example.mylab.service;

import com.example.mylab.dto.AnalyticsDTO;
import com.example.mylab.dto.PCDTO;
import com.example.mylab.model.PC;
import com.example.mylab.repository.ComplaintRepository;
import com.example.mylab.repository.PCRepository;
import com.example.mylab.repository.LabRepository;
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

    @Autowired
    private PCRepository pcRepository;

    @Autowired
    private LabRepository labRepository;

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

        // Average repair time (returned in minutes from DB, convert to hours for DTO)
        Double avgMinutes = complaintRepository.findAverageRepairTime();
        analytics.setAverageRepairTime(avgMinutes != null ? avgMinutes / 60.0 : 0.0);

        // Total resolved complaints
        analytics.setTotalResolvedComplaints(complaintRepository.countByStatus(com.example.mylab.model.ComplaintStatus.RESOLVED));

        // Lab Inventory Summary
        List<Object[]> inventoryData = pcRepository.findInventorySummary();
        Map<String, Map<String, Object>> labDataMap = new HashMap<>();

        for (Object[] result : inventoryData) {
            com.example.mylab.model.Lab lab = (com.example.mylab.model.Lab) result[0];
            com.example.mylab.model.PCType type = (com.example.mylab.model.PCType) result[1];
            Long count = (Long) result[2];

            String labName = (lab != null) ? lab.getName() : "Unassigned";
            labDataMap.putIfAbsent(labName, new HashMap<>());
            Map<String, Object> labInfo = labDataMap.get(labName);
            
            Long currentTotal = (Long) labInfo.getOrDefault("totalPCs", 0L);
            labInfo.put("totalPCs", currentTotal + count);
            
            if (!labInfo.containsKey("typeBreakdown")) {
                labInfo.put("typeBreakdown", new ArrayList<Map<String, Object>>());
            }
            List<Map<String, Object>> breakdown = (List<Map<String, Object>>) labInfo.get("typeBreakdown");
            
            Map<String, Object> typeEntry = new HashMap<>();
            String typeName = (type != null) ? (type.getBrand() + " " + type.getModel() + " (" + type.getProductionYear() + ")") : "Generic PC";
            typeEntry.put("typeName", typeName);
            typeEntry.put("count", count);
            breakdown.add(typeEntry);
        }

        List<Map<String, Object>> summaryList = new ArrayList<>();
        for (Map.Entry<String, Map<String, Object>> entry : labDataMap.entrySet()) {
            Map<String, Object> finalLabEntry = new HashMap<>();
            finalLabEntry.put("labName", entry.getKey());
            finalLabEntry.putAll(entry.getValue());
            summaryList.add(finalLabEntry);
        }
        analytics.setLabInventorySummary(summaryList);

        return analytics;
    }

    public Map<String, Object> getLabInventorySummary(Long labId) {
        com.example.mylab.model.Lab lab = labRepository.findById(labId)
                .orElseThrow(() -> new RuntimeException("Lab not found"));
        
        List<Object[]> detailedData = pcRepository.findDetailedInventorySummaryByLab(lab);
        
        Map<String, Object> labInfo = new HashMap<>();
        labInfo.put("labName", lab.getName());
        
        long totalPCs = 0;
        long totalWorking = 0;
        long totalNonWorking = 0;

        // Map to group entries by PCType
        Map<com.example.mylab.model.PCType, Map<String, Object>> typeMap = new HashMap<>();

        for (Object[] result : detailedData) {
            com.example.mylab.model.PCType type = (com.example.mylab.model.PCType) result[0];
            com.example.mylab.model.PCStatus status = (com.example.mylab.model.PCStatus) result[1];
            Long count = (Long) result[2];

            totalPCs += count;
            if (status == com.example.mylab.model.PCStatus.WORKING) {
                totalWorking += count;
            } else if (status == com.example.mylab.model.PCStatus.NON_WORKING) {
                totalNonWorking += count;
            }

            Map<String, Object> typeEntry = typeMap.computeIfAbsent(type, k -> {
                Map<String, Object> entry = new HashMap<>();
                String typeName = (k != null) ? (k.getBrand() + " " + k.getModel() + " (" + k.getProductionYear() + ")") : "Generic PC";
                entry.put("typeName", typeName);
                entry.put("ram", (k != null) ? k.getRam() : "N/A");
                entry.put("rom", (k != null) ? k.getRom() : "N/A");
                entry.put("total", 0L);
                entry.put("working", 0L);
                entry.put("nonWorking", 0L);
                return entry;
            });

            typeEntry.put("total", (long) typeEntry.get("total") + count);
            if (status == com.example.mylab.model.PCStatus.WORKING) {
                typeEntry.put("working", count);
            } else if (status == com.example.mylab.model.PCStatus.NON_WORKING) {
                typeEntry.put("nonWorking", count);
            }
        }
        
        labInfo.put("totalPCs", totalPCs);
        labInfo.put("workingPCs", totalWorking);
        labInfo.put("nonWorkingPCs", totalNonWorking);
        labInfo.put("typeBreakdown", new ArrayList<>(typeMap.values()));
        
        return labInfo;
    }
}
