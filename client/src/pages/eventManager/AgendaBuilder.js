import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Edit, 
  Trash2, 
  Upload,
  Save,
  Eye,
  CheckCircle
} from 'lucide-react';
import { agendaAPI, sessionAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AgendaBuilder = () => {
  const [agendaItems, setAgendaItems] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'session',
    startTime: '',
    endTime: '',
    location: '',
    speaker: '',
    sessionId: '',
    track: '',
    status: 'draft'
  });

  const itemTypes = [
    { value: 'session', label: 'Session', color: 'bg-blue-100 text-blue-800' },
    { value: 'keynote', label: 'Keynote', color: 'bg-purple-100 text-purple-800' },
    { value: 'break', label: 'Break', color: 'bg-green-100 text-green-800' },
    { value: 'networking', label: 'Networking', color: 'bg-orange-100 text-orange-800' },
    { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsResponse] = await Promise.all([
        sessionAPI.getAllSessions({ status: 'approved' })
      ]);
      
      // Try to fetch agenda builder data
      try {
        const agendaResponse = await agendaAPI.getBuilder();
        setAgendaItems(agendaResponse.data.items || []);
      } catch (error) {
        console.log('No agenda items yet');
        setAgendaItems([]);
      }
      
      setSessions(sessionsResponse.data.sessions || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await agendaAPI.updateAgendaItem(editingItem.id, formData);
        toast.success('Agenda item updated successfully');
      } else {
        await agendaAPI.addAgendaItem(formData);
        toast.success('Agenda item added successfully');
      }
      
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving agenda item:', error);
      toast.error(error.response?.data?.message || 'Failed to save agenda item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      type: item.type || 'session',
      startTime: item.startTime || '',
      endTime: item.endTime || '',
      location: item.location || '',
      speaker: item.speaker || '',
      sessionId: item.sessionId || '',
      track: item.track || '',
      status: item.status || 'draft'
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this agenda item?')) {
      return;
    }
    
    try {
      await agendaAPI.deleteAgendaItem(id);
      toast.success('Agenda item deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting agenda item:', error);
      toast.error('Failed to delete agenda item');
    }
  };

  const handleImportSessions = async () => {
    try {
      const response = await agendaAPI.importSessions();
      toast.success(`${response.data.importedCount} sessions imported successfully`);
      fetchData();
    } catch (error) {
      console.error('Error importing sessions:', error);
      toast.error('Failed to import sessions');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'session',
      startTime: '',
      endTime: '',
      location: '',
      speaker: '',
      sessionId: '',
      track: '',
      status: 'draft'
    });
    setEditingItem(null);
    setShowAddModal(false);
  };

  const getTypeStyle = (type) => {
    const typeConfig = itemTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.color : 'bg-gray-100 text-gray-800';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda Builder</h1>
          <p className="text-gray-600 mt-1">Create and manage the event agenda</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleImportSessions}
            className="btn-secondary flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import Sessions</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{agendaItems.length}</div>
          <div className="text-gray-600">Total Items</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {agendaItems.filter(item => item.type === 'session').length}
          </div>
          <div className="text-gray-600">Sessions</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">
            {agendaItems.filter(item => item.status === 'published').length}
          </div>
          <div className="text-gray-600">Published</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">
            {agendaItems.filter(item => item.status === 'draft').length}
          </div>
          <div className="text-gray-600">Draft</div>
        </div>
      </div>

      {/* Agenda Items */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Agenda Items</h2>
        </div>

        {agendaItems.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No agenda items yet</p>
            <p className="text-sm text-gray-500 mt-1">Add items manually or import sessions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {agendaItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeStyle(item.type)}`}>
                        {item.type}
                      </span>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    </div>
                    
                    {item.description && (
                      <p className="text-gray-600 mb-2">{item.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      {item.startTime && item.endTime && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(item.startTime)} - {formatTime(item.endTime)}</span>
                        </div>
                      )}
                      {item.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{item.location}</span>
                        </div>
                      )}
                      {item.speaker && (
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{item.speaker}</span>
                        </div>
                      )}
                      {item.track && (
                        <div className="text-blue-600 font-medium">
                          {item.track}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold mb-4">
              {editingItem ? 'Edit Agenda Item' : 'Add Agenda Item'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Type *</label>
                  <select
                    className="form-input"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                  >
                    {itemTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Start Time *</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">End Time *</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="form-label">Speaker</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.speaker}
                    onChange={(e) => setFormData({...formData, speaker: e.target.value})}
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="form-label">Link to Session</label>
                  <select
                    className="form-input"
                    value={formData.sessionId}
                    onChange={(e) => {
                      const session = sessions.find(s => s.id === e.target.value);
                      setFormData({
                        ...formData, 
                        sessionId: e.target.value,
                        title: session ? session.title : formData.title,
                        description: session ? session.abstract : formData.description,
                        speaker: session ? session.speakerName : formData.speaker,
                        track: session ? session.assignedTrack : formData.track
                      });
                    }}
                  >
                    <option value="">Select a session (optional)</option>
                    {sessions.map(session => (
                      <option key={session.id} value={session.id}>
                        {session.title} - {session.speakerName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingItem ? 'Update' : 'Add'} Item</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AgendaBuilder;