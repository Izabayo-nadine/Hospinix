package com.hospital.pharmacy;

import com.hospital.pharmacy.filter.JwtRequestFilter;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class PharmacyApplication {

    public static void main(String[] args) {
        SpringApplication.run(PharmacyApplication.class, args);
    }

//    @Bean
//    public WebMvcConfigurer corsConfigurer() {
//        return new WebMvcConfigurer() {
//            @Bean
//    public FilterRegistrationBean<JwtRequestFilter> jwtFilter(JwtRequestFilter filter) {
//        FilterRegistrationBean<JwtRequestFilter> registrationBean = new FilterRegistrationBean<>();
//        registrationBean.setFilter(filter);
//        registrationBean.addUrlPatterns("/admin/*", "/doctor/*", "/pharmacist/*", "/receptionist/*");
//        // Exclude authentication paths
//        registrationBean.addInitParameter("excludedPaths",
//                "/auth/login,/auth/register,/auth/create-admin,/h2-console,/swagger-ui,/v3/api-docs");
//        registrationBean.setOrder(1);
//        return registrationBean;
//
//    }   @Override
//            public void addCorsMappings(CorsRegistry registry) {
//                registry.addMapping("/**")
//                        .allowedOrigins("http://localhost:3000", "http://127.0.0.1:3000")
//                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
//                        .allowedHeaders("*")
//                        .allowCredentials(true);
//            }
//        };
//    }
//
////
}