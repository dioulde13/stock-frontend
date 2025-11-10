
'use client';

import { useState } from 'react';

const sampleSuppliers = [
  { id: 'F001', name: 'TechCorp SARL', email: 'contact@techcorp.fr', phone: '01 23 45 67 89', category: 'Électronique', totalOrders: 25250.00, status: 'Actif' },
  { id: 'F002', name: 'Électro Plus', email: 'info@electroplus.fr', phone: '01 98 76 54 32', category: 'Électroménager', totalOrders: 18890.50, status: 'Actif' },
  { id: 'F003', name: 'Digital Store', email: 'sales@digitalstore.fr', phone: '01 11 22 33 44', category: 'Informatique', totalOrders: 37100.75, status: 'Partenaire' },
  { id: 'F004', name: 'Mobile World', email: 'orders@mobileworld.fr', phone: '01 55 66 77 88', category: 'Téléphonie', totalOrders: 12450.25, status: 'Actif' },
  { id: 'F005', name: 'Audio Tech', email: 'contact@audiotech.fr', phone: '01 99 88 77 66', category: 'Audio', totalOrders: 6680.00, status: 'Suspendu' },
];

export default function SuppliersTable() {
  const [suppliers] = useState(sampleSuppliers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Partenaire': return 'bg-blue-100 text-blue-800';
      case 'Actif': return 'bg-green-100 text-green-800';
      case 'Suspendu': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="ri-search-line text-gray-400"></i>
          </div>
          <input
            type="text"
            placeholder="Rechercher un fournisseur..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total commandes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSuppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                      <i className="ri-truck-line text-white"></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                      <div className="text-sm text-gray-500">ID: {supplier.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{supplier.email}</div>
                  <div className="text-sm text-gray-500">{supplier.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.totalOrders.toFixed(2)} €</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(supplier.status)}`}>
                    {supplier.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-eye-line"></i>
                      </div>
                    </button>
                    <button className="text-green-600 hover:text-green-900 p-1 rounded">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-edit-line"></i>
                      </div>
                    </button>
                    <button className="text-orange-600 hover:text-orange-900 p-1 rounded">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-mail-line"></i>
                      </div>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
