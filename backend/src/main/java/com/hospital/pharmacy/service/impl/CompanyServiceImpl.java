package com.hospital.pharmacy.service.impl;

import com.hospital.pharmacy.dto.CompanyDTO;
import com.hospital.pharmacy.model.Company;
import com.hospital.pharmacy.repository.CompanyRepository;
import com.hospital.pharmacy.service.CompanyService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;

    @Autowired
    public CompanyServiceImpl(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Override
    public List<Company> findAllCompanies() {
        return companyRepository.findAll();
    }

    @Override
    public Company findCompanyById(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company not found with id: " + id));
    }

    @Override
    public Company findCompanyByCompanyId(String companyId) {
        return companyRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new EntityNotFoundException("Company not found with companyId: " + companyId));
    }

    @Override
    public Company createCompany(CompanyDTO companyDTO) {
        Company company = mapDtoToEntity(companyDTO);

        // Generate a unique company ID if not provided
        if (company.getCompanyId() == null || company.getCompanyId().isEmpty()) {
            company.setCompanyId("COMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        return companyRepository.save(company);
    }

    @Override
    public Company updateCompany(Long id, CompanyDTO companyDTO) {
        Company existingCompany = findCompanyById(id);

        // Update fields while preserving the ID and companyId
        Company updatedCompany = mapDtoToEntity(companyDTO);
        updatedCompany.setId(existingCompany.getId());
        updatedCompany.setCompanyId(existingCompany.getCompanyId());

        return companyRepository.save(updatedCompany);
    }

    @Override
    public void deleteCompany(Long id) {
        Company company = findCompanyById(id);
        companyRepository.delete(company);
    }

    @Override
    public List<Company> searchCompanies(String keyword) {
        return companyRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);
    }

    private Company mapDtoToEntity(CompanyDTO dto) {
        Company company = new Company();
        company.setId(dto.getId());
        company.setCompanyId(dto.getCompanyId());
        company.setName(dto.getName());
        company.setAddress(dto.getAddress());
        company.setPhone(dto.getPhone());
        company.setEmail(dto.getEmail());
        company.setWebsite(dto.getWebsite());
        company.setContactPerson(dto.getContactPerson());
        company.setRegistrationDate(dto.getRegistrationDate());
        company.setStatus("Active"); // Default status

        return company;
    }
}