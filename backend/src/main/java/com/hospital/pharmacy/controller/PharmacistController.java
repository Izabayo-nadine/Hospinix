package com.hospital.pharmacy.controller;

import com.hospital.pharmacy.dto.CompanyDTO;
import com.hospital.pharmacy.dto.DistributorDTO;
import com.hospital.pharmacy.dto.MedicineDTO;
import com.hospital.pharmacy.model.Company;
import com.hospital.pharmacy.model.Distributor;
import com.hospital.pharmacy.model.Medicine;
import com.hospital.pharmacy.model.Prescription;
import com.hospital.pharmacy.model.User;
import com.hospital.pharmacy.repository.CompanyRepository;
import com.hospital.pharmacy.repository.DistributorRepository;
import com.hospital.pharmacy.repository.MedicineRepository;
import com.hospital.pharmacy.repository.PrescriptionRepository;
import com.hospital.pharmacy.service.CompanyService;
import com.hospital.pharmacy.service.DistributorService;
import com.hospital.pharmacy.service.MedicineService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/pharmacist")
public class PharmacistController {

    private static final Logger logger = Logger.getLogger(PharmacistController.class.getName());

    @Autowired
    private MedicineService medicineService;

    @Autowired
    private CompanyService companyService;

    @Autowired
    private DistributorService distributorService;

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private DistributorRepository distributorRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    // Pharmacist Dashboard Statistics
    @GetMapping("/dashboard")
    public ResponseEntity<?> getPharmacistDashboard(HttpServletRequest request) {
        User pharmacist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (pharmacist == null || !role.equals("PHARMACIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMedicines", medicineRepository.count());
        stats.put("lowStockMedicines", medicineRepository.findByStockStatus("Low").size() +
                medicineRepository.findByStockStatus("Critical").size());
        stats.put("totalCompanies", companyRepository.count());
        stats.put("totalDistributors", distributorRepository.count());
        stats.put("pendingPrescriptions", prescriptionRepository.findByStatus("ACTIVE").size());

        return ResponseEntity.ok(stats);
    }

    // Get all medicines with filters
    @GetMapping("/medicines")
    public ResponseEntity<?> getMedicines(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String stockStatus,
            @RequestParam(required = false) String prescriptionFilter,
            HttpServletRequest request) {

        User pharmacist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (pharmacist == null || !role.equals("PHARMACIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        List<MedicineDTO> medicines = medicineService.filterMedicines(
                category, stockStatus, prescriptionFilter);

        return ResponseEntity.ok(medicines);
    }

    // Search medicines
    @GetMapping("/medicines/search")
    public ResponseEntity<?> searchMedicines(
            @RequestParam String keyword,
            HttpServletRequest request) {

        User pharmacist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (pharmacist == null || !role.equals("PHARMACIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        List<MedicineDTO> medicines = medicineService.searchMedicines(keyword);

        return ResponseEntity.ok(medicines);
    }

    // Create new medicine
    @PostMapping("/medicines")
    public ResponseEntity<?> createMedicine(
            @RequestBody MedicineDTO medicineDTO,
            HttpServletRequest request) {

        User pharmacist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (pharmacist == null || !role.equals("PHARMACIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        MedicineDTO createdMedicine = medicineService.createMedicine(medicineDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdMedicine);
    }

    // Update a medicine
    @PutMapping("/medicines/{medicineId}")
    public ResponseEntity<?> updateMedicine(
            @PathVariable String medicineId,
            @RequestBody MedicineDTO medicineDTO,
            HttpServletRequest request) {

        User pharmacist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (pharmacist == null || !role.equals("PHARMACIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        MedicineDTO updatedMedicine = medicineService.updateMedicine(medicineId, medicineDTO);

        return ResponseEntity.ok(updatedMedicine);
    }

    // Delete a medicine
    @DeleteMapping("/medicines/{medicineId}")
    public ResponseEntity<?> deleteMedicine(
            @PathVariable String medicineId,
            HttpServletRequest request) {

        User pharmacist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (pharmacist == null || !role.equals("PHARMACIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        medicineService.deleteMedicine(medicineId);

        return ResponseEntity.ok(Map.of("message", "Medicine deleted successfully"));
    }

    // Get all companies
    @GetMapping("/companies")
    public ResponseEntity<?> getCompanies(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String name,
            HttpServletRequest request) {

        User pharmacist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (pharmacist == null || !role.equals("PHARMACIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        List<Company> companies = companyRepository.findWithFilters(name, status);

        return ResponseEntity.ok(companies);
    }

    // Create new company
    @PostMapping("/companies")
    public ResponseEntity<?> createCompany(
            @RequestBody CompanyDTO companyDTO,
            HttpServletRequest request) {

        User pharmacist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (pharmacist == null || !role.equals("PHARMACIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        Company createdCompany = companyService.createCompany(companyDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdCompany);
    }

    // Update a company
    @PutMapping("/companies/{id}")
    public ResponseEntity<?> updateCompany(
            @PathVariable Long id,
            @RequestBody CompanyDTO companyDTO,
            HttpServletRequest request) {

        User pharmacist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (pharmacist == null || !role.equals("PHARMACIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        Company updatedCompany = companyService.updateCompany(id, companyDTO);

        return ResponseEntity.ok(updatedCompany);
    }

    // Get company by ID
    @GetMapping("/companies/{id}")
    public ResponseEntity<?> getCompanyById(
            @PathVariable Long id,
            HttpServletRequest request) {

        User pharmacist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (pharmacist == null || !role.equals("PHARMACIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        return companyRepository.findById(id)
                .map(company -> ResponseEntity.ok(company))
                .orElse(ResponseEntity.notFound().build());
    }

    // Get all distributors
    @GetMapping("/distributors")
    public ResponseEntity<?> getDistributors(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String status,
            HttpServletRequest request) {

        User pharmacist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (pharmacist == null || !role.equals("PHARMACIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        List<Distributor> distributors;
        if (region != null || status != null) {
            distributors = distributorService.findWithFilters(region, status);
        } else {
            distributors = distributorRepository.findAll();
        }

        return ResponseEntity.ok(distributors);
    }

    // Create new distributor
    @PostMapping("/distributors")
    public ResponseEntity<?> createDistributor(
            @RequestBody DistributorDTO distributorDTO,
            HttpServletRequest request) {

        User pharmacist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (pharmacist == null || !role.equals("PHARMACIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        Distributor createdDistributor = distributorService.createDistributor(distributorDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdDistributor);
    }

    // Update a distributor
    @PutMapping("/distributors/{id}")
    public ResponseEntity<?> updateDistributor(
            @PathVariable Long id,
            @RequestBody DistributorDTO distributorDTO,
            HttpServletRequest request) {

        User pharmacist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (pharmacist == null || !role.equals("PHARMACIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        Distributor updatedDistributor = distributorService.updateDistributor(id, distributorDTO);

        return ResponseEntity.ok(updatedDistributor);
    }

    // Get distributor by ID
    @GetMapping("/distributors/{id}")
    public ResponseEntity<?> getDistributorById(
            @PathVariable Long id,
            HttpServletRequest request) {

        User pharmacist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (pharmacist == null || !role.equals("PHARMACIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        return distributorRepository.findById(id)
                .map(distributor -> ResponseEntity.ok(distributor))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/medicines/low-stock")
    public ResponseEntity<?> getLowStockMedicines(HttpServletRequest request) {
        User pharmacist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (pharmacist == null || !role.equals("PHARMACIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }
        List<Medicine> medicines = medicineService.getLowStatusMedicines();
        logger.info("this is the low_Stock medicine " + medicines);
        return ResponseEntity.ok(medicines);

    }

    // Get active prescriptions to be filled
    @GetMapping("/prescriptions")
    public ResponseEntity<?> getActivePrescriptions(HttpServletRequest request) {
        User pharmacist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (pharmacist == null || !role.equals("PHARMACIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        List<Prescription> prescriptions = prescriptionRepository.findByStatus("ACTIVE");

        return ResponseEntity.ok(prescriptions);
    }

    // Get a specific prescription by ID
    @GetMapping("/prescriptions/{id}")
    public ResponseEntity<?> getPrescriptionById(
            @PathVariable Long id,
            HttpServletRequest request) {

        User pharmacist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (pharmacist == null || !role.equals("PHARMACIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        return prescriptionRepository.findById(id)
                .map(prescription -> ResponseEntity.ok(prescription))
                .orElse(ResponseEntity.notFound().build());
    }

    // Fill a prescription
    @PutMapping("/prescriptions/{id}/fill")
    public ResponseEntity<?> fillPrescription(
            @PathVariable Long id,
            HttpServletRequest request) {

        User pharmacist = (User) request.getAttribute("user");
        String role = (String) request.getAttribute("role");

        if (pharmacist == null || !role.equals("PHARMACIST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied"));
        }

        return prescriptionRepository.findById(id)
                .map(prescription -> {
                    if (!"ACTIVE".equals(prescription.getStatus())) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("message", "Prescription is not active"));
                    }

                    prescription.setStatus("COMPLETED");
                    // In a real implementation, we would need to update the medicine stock

                    return ResponseEntity.ok(prescriptionRepository.save(prescription));
                })
                .orElse(ResponseEntity.notFound().build());
    }

}