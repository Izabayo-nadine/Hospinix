package com.hospital.pharmacy.service;

import com.hospital.pharmacy.dto.MedicineDTO;
import com.hospital.pharmacy.model.Medicine;

import java.util.List;

public interface MedicineService {
    List<MedicineDTO> getAllMedicines();

    MedicineDTO getMedicineById(Long id);

    MedicineDTO getMedicineByMedicineId(String medicineId);

    MedicineDTO createMedicine(MedicineDTO medicineDTO);

    MedicineDTO updateMedicine(String medicineId, MedicineDTO medicineDTO);

    void deleteMedicine(String medicineId);

    List<MedicineDTO> searchMedicines(String keyword);

    List<Medicine> getLowStatusMedicines();

    // List<Medicine> getCriticalStatuMedicines();

    
    List<MedicineDTO> filterMedicines(String category, String stockStatus, String prescriptionFilter);

    List<String> getAllCategories();
}