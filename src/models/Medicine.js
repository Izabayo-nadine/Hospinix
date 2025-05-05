/**
 * Medicine Database Model Schema
 *
 * This is a reference model showing the relationships between Medicine, Company, and Distributor entities.
 * The actual implementation depends on the backend database system (SQL, NoSQL, etc.)
 */

/**
 * Medicine Schema
 */
const MedicineSchema = {
  id: "Number/UUID (Primary Key)",
  medicineId: "String (Business ID, unique)",
  name: "String (required)",
  category: "String (required)",
  description: "String",
  manufacturer: "String",
  batchNumber: "String",
  expiryDate: "Date",
  stock: "Number (required)",
  stockStatus: "String (High/Normal/Low/Critical)",
  price: "Number (required)",
  requiresPrescription: "Boolean",
  dosageForm: "String (Tablet/Capsule/Syrup/etc.)",
  strength: "String",
  interactions: "Array of Strings",
  sideEffects: "Array of Strings",

  // Relationships
  companyId: "Foreign Key to Company", // Many medicines can come from one company
  company: "Object (Reference to Company entity)",

  distributorId: "Foreign Key to Distributor", // Many medicines can be distributed by one distributor
  distributor: "Object (Reference to Distributor entity)",

  // Timestamps
  createdAt: "Date",
  updatedAt: "Date",
};

/**
 * Company Schema
 */
const CompanySchema = {
  id: "Number/UUID (Primary Key)",
  companyId: "String (Business ID, unique)",
  name: "String (required)",
  address: "String (required)",
  phone: "String (required)",
  email: "String",
  website: "String",
  contactPerson: "String",
  licenseNumber: "String",
  registrationDate: "Date",

  // Relationships
  medicines: "Array of Medicine references", // One-to-Many: One company produces many medicines

  // Timestamps
  createdAt: "Date",
  updatedAt: "Date",
};

/**
 * Distributor Schema
 */
const DistributorSchema = {
  id: "Number/UUID (Primary Key)",
  distributorId: "String (Business ID, unique)",
  name: "String (required)",
  logoUrl: "String",
  region: "String (required)",
  headquarters: "String",
  areas: "Array of Strings",
  contactName: "String",
  contactTitle: "String",
  phone: "String (required)",
  email: "String",
  website: "String",
  relationshipSince: "Date",
  contractStatus: "String (Active/Pending/Expired/On Hold)",
  contractRenewal: "Date",
  deliveryTime: "String",
  rating: "Number",
  reliability: "String",
  lastDelivery: "Date",
  paymentTerms: "String",
  specialties: "Array of Strings",

  // Relationships
  medicines: "Array of Medicine references", // One-to-Many: One distributor distributes many medicines

  // Timestamps
  createdAt: "Date",
  updatedAt: "Date",
};

/**
 * Relationship Summary:
 *
 * 1. Medicine to Company: Many-to-One
 *    - A medicine belongs to only one company
 *    - A company can produce many medicines
 *
 * 2. Medicine to Distributor: Many-to-One
 *    - A medicine is distributed by one distributor
 *    - A distributor can distribute many medicines
 *
 * Note: In a more complex system, the Medicine-to-Distributor relationship
 * could be Many-to-Many, where a medicine could be distributed by multiple
 * distributors and a distributor handles many medicines. That would require
 * a junction table (MedicineDistributor) to manage the relationship.
 */
