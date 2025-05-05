package com.hospital.pharmacy.service;

import com.hospital.pharmacy.dto.CompanyDTO;
import com.hospital.pharmacy.model.Company;

import java.util.List;

public interface CompanyService {
    List<Company> findAllCompanies();

    Company findCompanyById(Long id);

    Company findCompanyByCompanyId(String companyId);

    Company createCompany(CompanyDTO companyDTO);

    Company updateCompany(Long id, CompanyDTO companyDTO);

    void deleteCompany(Long id);

    List<Company> searchCompanies(String keyword);
}