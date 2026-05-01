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

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private PCService pcService;

    @Autowired
    private PCRepository pcRepository;

    @Autowired
    private LabRepository labRepository;

    @Autowired
    private com.example.mylab.repository.PCTypeRepository pcTypeRepository;

    public AnalyticsDTO getAnalytics() {
        AnalyticsDTO analytics = new AnalyticsDTO();

        // Most problematic PCs
        List<Object[]> problematicPCs = complaintRepository.findMostProblematicPCs();
        List<Map<String, Object>> pcList = new ArrayList<>();
        for (Object[] result : problematicPCs) {
            Long pcId = (Long) result[0];
            Long count = (Long) result[1];
            if (pcId == null) continue;
            PC pc = pcRepository.findById(pcId).orElse(null);
            if (pc == null) continue;
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

        // Average repair time (calculate in Java to be DB-agnostic)
        List<Object[]> resolvedTimes = complaintRepository.findResolvedTimes();
        double totalMinutes = 0;
        int count = 0;
        for (Object[] time : resolvedTimes) {
            if (time[0] != null && time[1] != null) {
                LocalDateTime reportedAt = (LocalDateTime) time[0];
                LocalDateTime resolvedAt = (LocalDateTime) time[1];
                totalMinutes += java.time.Duration.between(reportedAt, resolvedAt).toMinutes();
                count++;
            }
        }
        double avgMinutes = count > 0 ? totalMinutes / count : 0.0;
        analytics.setAverageRepairTime(avgMinutes / 60.0);

        // Total resolved complaints
        analytics.setTotalResolvedComplaints(complaintRepository.countByStatus(com.example.mylab.model.ComplaintStatus.RESOLVED));

        // Lab Inventory Summary
        List<Object[]> inventoryData = pcRepository.findInventorySummary();
        Map<String, Map<String, Object>> labDataMap = new HashMap<>();

        for (Object[] result : inventoryData) {
            Long labId = (Long) result[0];
            Long typeId = (Long) result[1];
            Long pcCount = (Long) result[2];

            com.example.mylab.model.Lab lab = labId != null ? labRepository.findById(labId).orElse(null) : null;
            com.example.mylab.model.PCType type = typeId != null ? pcTypeRepository.findById(typeId).orElse(null) : null;

            String labName = (lab != null) ? lab.getName() : "Unassigned";
            labDataMap.putIfAbsent(labName, new HashMap<>());
            Map<String, Object> labInfo = labDataMap.get(labName);
            
            Long currentTotal = (Long) labInfo.getOrDefault("totalPCs", 0L);
            labInfo.put("totalPCs", currentTotal + pcCount);
            
            if (!labInfo.containsKey("typeBreakdown")) {
                labInfo.put("typeBreakdown", new ArrayList<Map<String, Object>>());
            }
            List<Map<String, Object>> breakdown = (List<Map<String, Object>>) labInfo.get("typeBreakdown");
            
            Map<String, Object> typeEntry = new HashMap<>();
            String typeName = (type != null) ? (type.getBrand() + " " + type.getModel() + " (" + type.getProductionYear() + ")") : "Generic PC";
            typeEntry.put("typeName", typeName);
            typeEntry.put("count", pcCount);
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
            Long typeId = (Long) result[0];
            com.example.mylab.model.PCStatus status = (com.example.mylab.model.PCStatus) result[1];
            Long pcCount = (Long) result[2];
            com.example.mylab.model.PCType type = typeId != null ? pcTypeRepository.findById(typeId).orElse(null) : null;

            totalPCs += pcCount;
            if (status == com.example.mylab.model.PCStatus.WORKING) {
                totalWorking += pcCount;
            } else if (status == com.example.mylab.model.PCStatus.NON_WORKING) {
                totalNonWorking += pcCount;
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

            typeEntry.put("total", (long) typeEntry.get("total") + pcCount);
            if (status == com.example.mylab.model.PCStatus.WORKING) {
                typeEntry.put("working", pcCount);
            } else if (status == com.example.mylab.model.PCStatus.NON_WORKING) {
                typeEntry.put("nonWorking", pcCount);
            }
        }
        
        labInfo.put("totalPCs", totalPCs);
        labInfo.put("workingPCs", totalWorking);
        labInfo.put("nonWorkingPCs", totalNonWorking);
        labInfo.put("typeBreakdown", new ArrayList<>(typeMap.values()));
        
        return labInfo;
    }
}
