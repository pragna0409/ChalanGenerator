import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Plus, Trash2, Download, Printer } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ChalanItem, Client } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ChalanFormProps {
  onNavigate: (page: string) => void;
}

export const ChalanForm: React.FC<ChalanFormProps> = ({ onNavigate }) => {
  const { clients, getClientInventory, getClientChalanCount, addChalan } = useData();
  const { user } = useAuth();

  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(clients[0] || null);
  const [serialNumber, setSerialNumber] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [poDate, setPoDate] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<ChalanItem[]>([
    { id: '1', sno: 1, particulars: '', noOfBoxes: 0, costPerBox: 0, totalQty: 0 }
  ]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  useEffect(() => {
    if (selectedClientId) {
      const client = clients.find(c => c.id === selectedClientId);
      setSelectedClient(client || null);
      setSerialNumber(getClientChalanCount(selectedClientId) + 1);
    }
  }, [selectedClientId, clients, getClientChalanCount]);

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  const handleItemChange = (index: number, field: keyof ChalanItem, value: string | number) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };

      // Auto-calculate total quantity
      if (field === 'noOfBoxes' || field === 'costPerBox') {
        const item = newItems[index];
        newItems[index].totalQty = item.noOfBoxes * item.costPerBox;
      }

      return newItems;
    });
  };

  const handleParticularsChange = (index: number, value: string) => {
    handleItemChange(index, 'particulars', value);

    if (value.trim() && selectedClientId) {
      const inventory = getClientInventory(selectedClientId);
      const filtered = inventory
        .filter(item => item.itemName.toLowerCase().includes(value.toLowerCase()))
        .map(item => item.itemName);
      setSuggestions(filtered);
      setActiveSuggestionIndex(-1);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (index: number, suggestion: string) => {
    handleItemChange(index, 'particulars', suggestion);
    setSuggestions([]);
    setActiveSuggestionIndex(-1);
  };

  const addNewItem = () => {
    const newItem: ChalanItem = {
      id: Date.now().toString(),
      sno: items.length + 1,
      particulars: '',
      noOfBoxes: 0,
      costPerBox: 0,
      totalQty: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (index: number) => {
    setItems(prev => {
      const newItems = prev.filter((_, i) => i !== index);
      return newItems.map((item, i) => ({ ...item, sno: i + 1 }));
    });
  };

  const handleSaveChalan = () => {
    if (!selectedClient || !user) return;

    const chalanData = {
      clientId: selectedClient.id,
      client: selectedClient,
      serialNumber,
      date,
      poDate,
      poNumber,
      items: items.filter(item => item.particulars.trim()),
      vehicleNo,
      remarks,
      createdBy: user.username
    };

    addChalan(chalanData);
    alert('Chalan saved successfully!');

    // Reset form
    setItems([{ id: '1', sno: 1, particulars: '', noOfBoxes: 0, costPerBox: 0, totalQty: 0 }]);
    setPoDate('');
    setPoNumber('');
    setVehicleNo('');
    setRemarks('');
    setSerialNumber(getClientChalanCount(selectedClientId) + 1);
  };

  const handleDownloadPDF = async () => {
    if (!selectedClient) return;

    const element = document.getElementById('chalan-form');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`chalan-${selectedClient.name}-${serialNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8 no-print">
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-white">Create Delivery Chalan</h1>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-6 no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Select Client</label>
            <select
              value={selectedClientId}
              onChange={(e) => handleClientChange(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" className="text-gray-900">Choose a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id} className="text-gray-900">
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSaveChalan}
              disabled={!selectedClient}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Chalan
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={!selectedClient}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              disabled={!selectedClient}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      <div id="chalan-form" className="bg-white rounded-xl p-4 shadow-lg" style={{ maxWidth: '210mm', margin: '0 auto', fontSize: '11px' }}>
        {/* Header */}
        <div className="border-b-2 border-gray-800 pb-2 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Delivery Chalan</h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Date: {date}</p>
              <p className="text-xs text-gray-600">S.No: {serialNumber}</p>
            </div>
          </div>
        </div>

        {/* Client Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">To:</h3>
            <div className="bg-gray-50 p-2 rounded-lg min-h-[80px]">
              {selectedClient ? (
                <div className="space-y-1">
                  <p className="font-medium text-gray-800 text-xs">{selectedClient.name}</p>
                  <p className="text-gray-600 text-xs">{selectedClient.address}</p>
                  <p className="text-gray-600 text-xs">Phone: {selectedClient.phone}</p>
                  <p className="text-gray-600 text-xs">Email: {selectedClient.email}</p>
                </div>
              ) : (
                <p className="text-gray-400">Select a client to auto-fill details</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">PO Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={poDate}
                  onChange={(e) => setPoDate(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">PO Number</label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter PO number"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Serial Number</label>
              <input
                type="number"
                value={serialNumber}
                onChange={(e) => setSerialNumber(parseInt(e.target.value) || 1)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-800">Items</h3>
            <button
              onClick={addNewItem}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '10px' }}>
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700">S.No</th>
                  <th className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700">Particulars</th>
                  <th className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700">No. of Boxes</th>
                  <th className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700">Cost per Box</th>
                  <th className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700">Total Qty</th>
                  <th className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 px-2 py-1">{item.sno}</td>
                    <td className="border border-gray-300 px-2 py-1">
                      <div className="relative">
                        <input
                          type="text"
                          value={item.particulars}
                          onChange={(e) => handleParticularsChange(index, e.target.value)}
                          className="w-full px-2 py-1 border-none focus:ring-0 focus:outline-none"
                          placeholder="Enter item name"
                        />
                        {suggestions.length > 0 && index === items.length - 1 && (
                          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            {suggestions.map((suggestion, i) => (
                              <button
                                key={i}
                                onClick={() => selectSuggestion(index, suggestion)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        value={item.noOfBoxes}
                        onChange={(e) => handleItemChange(index, 'noOfBoxes', parseInt(e.target.value) || 0)}
                        className="w-full px-1 py-0.5 text-xs border-none focus:ring-0 focus:outline-none"
                        min="0"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        value={item.costPerBox}
                        onChange={(e) => handleItemChange(index, 'costPerBox', parseFloat(e.target.value) || 0)}
                        className="w-full px-1 py-0.5 text-xs border-none focus:ring-0 focus:outline-none"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        value={item.totalQty}
                        onChange={(e) => handleItemChange(index, 'totalQty', parseFloat(e.target.value) || 0)}
                        className="w-full px-1 py-0.5 text-xs border-none focus:ring-0 focus:outline-none"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle No.</label>
            <input
              type="text"
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter vehicle number"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Enter any remarks"
            />
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-3">
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2">Receiver's Signature:</h4>
            <div className="h-12 border-b border-gray-300"></div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2">For Creative Prints:</h4>
            <div className="h-12 border-b border-gray-300"></div>
            <p className="text-xs text-gray-600 mt-1">Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};