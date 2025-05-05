package com.hospital.pharmacy.service.impl;

import com.hospital.pharmacy.dto.MedicineDTO;
import com.hospital.pharmacy.model.Company;
import com.hospital.pharmacy.model.Medicine;
import com.hospital.pharmacy.repository.CompanyRepository;
import com.hospital.pharmacy.repository.MedicineRepository;
import com.hospital.pharmacy.service.MedicineService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository medicineRepository;
    private final CompanyRepository companyRepository;

    @Autowired
    public MedicineServiceImpl(MedicineRepository medicineRepository, CompanyRepository companyRepository) {
        this.medicineRepository = medicineRepository;
        this.companyRepository = companyRepository;
    }

    @Override
    public List<MedicineDTO> getAllMedicines() {
        return medicineRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MedicineDTO getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Medicine not found with id: " + id));
        return convertToDTO(medicine);
    }

    @Override
    public MedicineDTO getMedicineByMedicineId(String medicineId) {
        Medicine medicine = medicineRepository.findByMedicineId(medicineId)
                .orElseThrow(() -> new EntityNotFoundException("Medicine not found with medicineId: " + medicineId));
        return convertToDTO(medicine);
    }

    @Override
    @Transactional
    public MedicineDTO createMedicine(MedicineDTO medicineDTO) {
        Medicine medicine = convertToEntity(medicineDTO);

        // Set stock status based on stock level
        if (medicine.getStock() <= 10) {
            medicine.setStockStatus("Critical");
        } else if (medicine.getStock() <= 30) {
            medicine.setStockStatus("Low");
        } else if (medicine.getStock() <= 100) {
            medicine.setStockStatus("Normal");
        } else {
            medicine.setStockStatus("High");
        }

        Medicine savedMedicine = medicineRepository.save(medicine);
        return convertToDTO(savedMedicine);
    }

    @Override
    @Transactional
    public MedicineDTO updateMedicine(String medicineId, MedicineDTO medicineDTO) {
        Medicine existingMedicine = medicineRepository.findByMedicineId(medicineId)
                .orElseThrow(() -> new EntityNotFoundException("Medicine not found with medicineId: " + medicineId));

        // Update fields
        existingMedicine.setName(medicineDTO.getName());
        existingMedicine.setCategory(medicineDTO.getCategory());
        existingMedicine.setDescription(medicineDTO.getDescription());
        existingMedicine.setManufacturer(medicineDTO.getManufacturer());
        existingMedicine.setBatchNumber(medicineDTO.getBatchNumber());
        existingMedicine.setExpiryDate(medicineDTO.getExpiryDate());
        existingMedicine.setStock(medicineDTO.getStock());
        existingMedicine.setPrice(medicineDTO.getPrice());
        existingMedicine.setRequiresPrescription(medicineDTO.isRequiresPrescription());
        existingMedicine.setDosageForm(medicineDTO.getDosageForm());
        existingMedicine.setStrength(medicineDTO.getStrength());
        existingMedicine.setInteractions(medicineDTO.getInteractions());
        existingMedicine.setSideEffects(medicineDTO.getSideEffects());

        // Set stock status based on stock level
        if (existingMedicine.getStock() <= 10) {
            existingMedicine.setStockStatus("Critical");
        } else if (existingMedicine.getStock() <= 30) {
            existingMedicine.setStockStatus("Low");
        } else if (existingMedicine.getStock() <= 100) {
            existingMedicine.setStockStatus("Normal");
        } else {
            existingMedicine.setStockStatus("High");
        }

        // Update company if provided
        if (medicineDTO.getCompanyId() != null) {
            Company company = companyRepository.findByCompanyId(medicineDTO.getCompanyId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Company not found with companyId: " + medicineDTO.getCompanyId()));
            existingMedicine.setCompany(company);
        }

        Medicine updatedMedicine = medicineRepository.save(existingMedicine);
        return convertToDTO(updatedMedicine);
    }

    @Override
    @Transactional
    public void deleteMedicine(String medicineId) {
        Medicine medicine = medicineRepository.findByMedicineId(medicineId)
                .orElseThrow(() -> new EntityNotFoundException("Medicine not found with medicineId: " + medicineId));
        medicineRepository.delete(medicine);
    }

    @Override
    public List<MedicineDTO> searchMedicines(String keyword) {
        return medicineRepository.searchMedicines(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<Medicine> getLowStatusMedicines() {
        return medicineRepository.findByStockStatus("Low");
    }

    @Override
    public List<MedicineDTO> filterMedicines(String category, String stockStatus, String prescriptionFilter) {
        return medicineRepository.findWithFilters(category, stockStatus, prescriptionFilter).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getAllCategories() {
        return medicineRepository.findAll().stream()
                .map(Medicine::getCategory)
                .distinct()
                .collect(Collectors.toList());
    }

    // Helper methods to convert between entity and DTO
    private MedicineDTO convertToDTO(Medicine medicine) {
        MedicineDTO dto = new MedicineDTO();
        dto.setId(medicine.getId());
        dto.setMedicineId(medicine.getMedicineId());
        dto.setName(medicine.getName());
        dto.setCategory(medicine.getCategory());
        dto.setDescription(medicine.getDescription());
        dto.setManufacturer(medicine.getManufacturer());
        dto.setBatchNumber(medicine.getBatchNumber());
        dto.setExpiryDate(medicine.getExpiryDate());
        dto.setStock(medicine.getStock());
        dto.setStockStatus(medicine.getStockStatus());
        dto.setPrice(medicine.getPrice());
        dto.setRequiresPrescription(medicine.isRequiresPrescription());
        dto.setDosageForm(medicine.getDosageForm());
        dto.setStrength(medicine.getStrength());
        dto.setInteractions(medicine.getInteractions());
        dto.setSideEffects(medicine.getSideEffects());

        if (medicine.getCompany() != null) {
            dto.setCompanyId(medicine.getCompany().getCompanyId());
            dto.setCompanyName(medicine.getCompany().getName());
        }

        return dto;
    }

    private Medicine convertToEntity(MedicineDTO dto) {
        Medicine medicine = new Medicine();
        medicine.setMedicineId(dto.getMedicineId());
        medicine.setName(dto.getName());
        medicine.setCategory(dto.getCategory());
        medicine.setDescription(dto.getDescription());
        medicine.setManufacturer(dto.getManufacturer());
        medicine.setBatchNumber(dto.getBatchNumber());
        medicine.setExpiryDate(dto.getExpiryDate());
        medicine.setStock(dto.getStock());
        medicine.setStockStatus(dto.getStockStatus());
        medicine.setPrice(dto.getPrice());
        medicine.setRequiresPrescription(dto.isRequiresPrescription());
        medicine.setDosageForm(dto.getDosageForm());
        medicine.setStrength(dto.getStrength());
        medicine.setInteractions(dto.getInteractions());
        medicine.setSideEffects(dto.getSideEffects());

        if (dto.getCompanyId() != null) {
            Company company = companyRepository.findByCompanyId(dto.getCompanyId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Company not found with companyId: " + dto.getCompanyId()));
            medicine.setCompany(company);
        }

        return medicine;
    }
}