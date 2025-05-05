import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, Info } from 'lucide-react';

const MedicationCard = ({ 
  medication, 
  onClick,
  compact = false
}) => {
  const {
    name,
    dosage,
    category,
    manufacturer,
    stock,
    expiryDate,
    price,
    sku,
    image
  } = medication;

  // Calculate if the medication will expire soon (within 90 days)
  const expiryDate90DaysFromNow = new Date();
  expiryDate90DaysFromNow.setDate(expiryDate90DaysFromNow.getDate() + 90);
  
  const isExpiringSoon = expiryDate && new Date(expiryDate) <= expiryDate90DaysFromNow;
  const isExpired = expiryDate && new Date(expiryDate) <= new Date();
  
  // Determine stock status
  const getStockStatus = () => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'red' };
    if (stock < 10) return { label: 'Low Stock', color: 'yellow' };
    if (stock > 50) return { label: 'Well Stocked', color: 'green' };
    return { label: 'In Stock', color: 'green' };
  };
  
  const stockStatus = getStockStatus();
  
  // Format expiry date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Default placeholder image if none provided
  const defaultImage = 'https://placehold.co/200x150?text=Medication';
  
  if (compact) {
    return (
      <Card 
        className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        onClick={onClick}
      >
        <div className="p-3 flex items-center">
          <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-gray-100">
            <img 
              src={image || defaultImage} 
              alt={name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="ml-3 flex-grow min-w-0">
            <h3 className="font-medium text-sm truncate">{name}</h3>
            <p className="text-xs text-gray-500 truncate">{dosage}</p>
            
            <div className="flex items-center mt-1">
              <Badge color={stockStatus.color} className="mr-1 text-xs py-0 px-1">
                {stockStatus.label}
              </Badge>
              
              {isExpired && (
                <Badge color="red" className="text-xs py-0 px-1">
                  Expired
                </Badge>
              )}
            </div>
          </div>
          
          <div className="ml-2 text-right">
            <div className="text-sm font-semibold">${parseFloat(price).toFixed(2)}</div>
            <div className="text-xs text-gray-500">{stock} units</div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="relative">
        <div className="h-40 bg-gray-100">
          <img 
            src={image || defaultImage}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {isExpiringSoon && (
          <div className="absolute top-2 right-2">
            <div className="bg-yellow-100 p-1 rounded-full">
              <AlertTriangle 
                size={isExpired ? 24 : 20} 
                className={isExpired ? "text-red-500" : "text-yellow-500"}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{name}</h3>
            <p className="text-sm text-gray-600">{dosage}</p>
          </div>
          <Badge color={stockStatus.color}>{stockStatus.label}</Badge>
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Manufacturer:</span>
            <p className="truncate">{manufacturer}</p>
          </div>
          <div>
            <span className="text-gray-500">Category:</span>
            <p>{category}</p>
          </div>
          <div>
            <span className="text-gray-500">SKU:</span>
            <p>{sku}</p>
          </div>
          <div>
            <span className="text-gray-500">Stock:</span>
            <p>{stock} units</p>
          </div>
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <div>
            <span className="text-gray-500 text-sm">Expires:</span>
            <p className={`text-sm ${isExpired ? 'text-red-500 font-medium' : ''}`}>
              {formatDate(expiryDate)}
            </p>
          </div>
          <p className="text-lg font-bold">${parseFloat(price).toFixed(2)}</p>
        </div>
      </div>
    </Card>
  );
};

export default MedicationCard;