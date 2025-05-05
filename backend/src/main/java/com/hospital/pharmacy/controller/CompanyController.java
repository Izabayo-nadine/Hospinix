package com.hospital.pharmacy.controller;

import com.hospital.pharmacy.dto.CompanyDTO;
import com.hospital.pharmacy.model.Company;
import com.hospital.pharmacy.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    @Autowired
    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public ResponseEntity<List<Company>> getAllCompanies() {
        List<Company> companies = companyService.findAllCompanies();
        return new ResponseEntity<>(companies, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompanyById(@PathVariable Long id) {
        Company company = companyService.findCompanyById(id);
        return new ResponseEntity<>(company, HttpStatus.OK);
    }

    @GetMapping("/companyId/{companyId}")
    public ResponseEntity<Company> getCompanyByCompanyId(@PathVariable String companyId) {
        Company company = companyService.findCompanyByCompanyId(companyId);
        return new ResponseEntity<>(company, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Company> createCompany(@Valid @RequestBody CompanyDTO companyDTO) {
        Company createdCompany = companyService.createCompany(companyDTO);
        return new ResponseEntity<>(createdCompany, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable Long id, @Valid @RequestBody CompanyDTO companyDTO) {
        Company updatedCompany = companyService.updateCompany(id, companyDTO);
        return new ResponseEntity<>(updatedCompany, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Company>> searchCompanies(@RequestParam String keyword) {
        List<Company> companies = companyService.searchCompanies(keyword);
        return new ResponseEntity<>(companies, HttpStatus.OK);
    }
}