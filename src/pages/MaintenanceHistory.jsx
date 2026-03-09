import React, { useState } from 'react';
import { Calendar, User, Wrench, DollarSign, Plus, X } from 'lucide-react';

export function MaintenanceHistoryDialog({ isOpen, onClose, item, onSave }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Inspection',
    technician: '',
    description: '',
    cost: '',
    nextServiceDate: ''
  });

  const MAINTENANCE_TYPES = [
    'Inspection',
    'Repair',
    'Overhaul',
    'Calibration',
    'Replacement',
    'Testing'
  ];

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRecord = {
      id: `m${Date.now()}`,
      date: formData.date,
      type: formData.type,
      technician: formData.technician,
      description: formData.description,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      nextServiceDate: formData.nextServiceDate || undefined
    };
    const updatedItem = {
      ...item,
      maintenanceHistory: [newRecord, ...(item.maintenanceHistory || [])]
    };
    if (onSave) onSave(updatedItem);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'Inspection',
      technician: '',
      description: '',
      cost: '',
      nextServiceDate: ''
    });
    setShowAddForm(false);
  };

  const getMaintenanceTypeColor = (type) => {
    switch (type) {
      case 'Inspection': return 'bg-blue-100 text-blue-700';
      case 'Repair': return 'bg-orange-100 text-orange-700';
      case 'Overhaul': return 'bg-purple-100 text-purple-700';
      case 'Calibration': return 'bg-green-100 text-green-700';
      case 'Replacement': return 'bg-red-100 text-red-700';
      case 'Testing': return 'bg-cyan-100 text-cyan-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Maintenance History</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <div className="font-semibold">{item.name}</div>
          <div className="text-sm">Part Number: {item.partNumber}</div>
          {item.serialNumber && <div className="text-sm">Serial Number: {item.serialNumber}</div>}
        </div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-100"
          >
            <Plus className="h-4 w-4" />
            Add Maintenance Record
          </button>
        )}

        {showAddForm && (
          <form onSubmit={handleSubmit} className="border border-gray-200 p-4 rounded-lg mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="border rounded px-2 py-1 text-sm"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium">Maintenance Type *</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="border rounded px-2 py-1 text-sm"
                  required
                >
                  {MAINTENANCE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium">Technician Name *</label>
              <input
                type="text"
                value={formData.technician}
                onChange={e => setFormData(prev => ({ ...prev, technician: e.target.value }))}
                placeholder="e.g., Gwen Gonzales"
                className="border rounded px-2 py-1 text-sm"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium">Description *</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Describe the maintenance work performed..."
                className="border rounded px-2 py-1 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium">Cost (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={e => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                  className="border rounded px-2 py-1 text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium">Next Service Date</label>
                <input
                  type="date"
                  value={formData.nextServiceDate}
                  onChange={e => setFormData(prev => ({ ...prev, nextServiceDate: e.target.value }))}
                  className="border rounded px-2 py-1 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Add Record
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 border px-4 py-2 rounded hover:bg-gray-100">
                Cancel
              </button>
            </div>
          </form>
        )}

        <hr className="my-4" />

        <div>
          <h3 className="font-semibold mb-2">History ({(item.maintenanceHistory || []).length} records)</h3>
          {(!item.maintenanceHistory || item.maintenanceHistory.length === 0) ? (
            <div className="text-center py-8 text-gray-400">
              <Wrench className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No maintenance records yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {item.maintenanceHistory.map(record => (
                <div key={record.id} className="border rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 text-xs rounded ${getMaintenanceTypeColor(record.type)}`}>
                      {record.type}
                    </span>
                    {record.cost && (
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <DollarSign className="h-3 w-3" /> ₱{record.cost.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <p className="text-sm mb-2">{record.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" /> {record.technician}
                    </div>
                    {record.nextServiceDate && <div>Next Service: {record.nextServiceDate}</div>}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" /> {record.date}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}