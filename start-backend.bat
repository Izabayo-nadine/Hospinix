@echo off
echo Starting Hospital Pharmacy Backend...
cd backend
call mvn spring-boot:run

echo If you want to manually start the backend, navigate to the 'backend' folder and run:
echo mvn spring-boot:run 