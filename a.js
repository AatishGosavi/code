import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, Save, X, Settings, List, Users, Trash2, LogIn, LogOut, Ticket, Edit, CheckSquare, Wrench, Package, Tag, Layers, Clock } from 'lucide-react';
import { createPortal } from 'react-dom';

// Utility to generate a unique ID for events and users
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Custom Message/Confirmation Box Component ---
const MessageBox = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full space-y-4 text-center">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-gray-600">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {onConfirm ? 'Cancel' : 'OK'}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};


// --- Login Page Component ---
const LoginPage = ({ onLogin, users, onGoToAnonymousForm }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Check hardcoded admin user
    if (username === 'admin' && password === 'password123') {
      onLogin(username, 'Admin'); // Pass Admin role
      return;
    }
    // Check against the in-memory users list
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user.username, user.role); // Pass the user's assigned role
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-sm w-full space-y-6">
        <div className="flex flex-col items-center">
          <LogIn className="w-12 h-12 text-blue-500 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">Login</h2>
          <p className="text-gray-500 mt-2">Enter your credentials to continue</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            className="w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-600 transition-all duration-200"
          >
            Sign In
          </button>
        </form>
        <div className="text-center mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onGoToAnonymousForm}
            className="text-blue-500 font-semibold hover:underline transition-colors"
          >
            Report a Breakdown Anonymously
          </button>
        </div>
      </div>
    </div>
  );
};


// Calendar component for the main display
const CalendarComponent = ({ pmTickets, currentMonth, currentYear, onPrev, onNext, onDayClick }) => {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const today = new Date();
  const todayString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  const dayCells = [];

  // Blank cells for the beginning of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    dayCells.push(<div key={`blank-${i}`} className="day-cell inactive"></div>);
  }

  // Day cells for the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(currentYear, currentMonth, day);
    const dayString = `${currentYear}-${currentMonth}-${day}`;

    // Count *all* PM tickets for this day
    const dayPmTickets = pmTickets.filter(ticket => {
      const ticketDate = new Date(ticket.scheduledDate);
      return ticketDate.getDate() === day && ticketDate.getMonth() === currentMonth && ticketDate.getFullYear() === currentYear;
    });

    const pendingCount = dayPmTickets.filter(t => t.status === 'Open').length;
    const completedCount = dayPmTickets.filter(t => t.status === 'Closed').length;

    const isToday = dayString === todayString;

    dayCells.push(
      <div
        key={`day-${day}`}
        className={`day-cell cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-blue-400 ${isToday ? 'today bg-blue-500 text-gray-900' : 'bg-gray-100'} ${dayPmTickets.length > 0 ? 'has-event border-2 border-blue-500' : ''}`}
        onClick={() => onDayClick(dayDate, dayPmTickets)}
      >
        <div className="day-number text-lg font-semibold text-gray-900">{day}</div>
        {pendingCount > 0 && (
          <div className={`event-title mt-1 text-xs font-bold truncate w-full px-1 text-red-500`}>
            Pending: {pendingCount}
          </div>
        )}
        {completedCount > 0 && pendingCount === 0 && (
          <div className={`event-title mt-1 text-xs font-bold truncate w-full px-1 text-green-500`}>
            Completed: {completedCount}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onPrev} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h2 className="text-3xl font-bold text-gray-800">{monthNames[currentMonth]} {currentYear}</h2>
        <button onClick={onNext} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="day-name text-blue-500 font-bold p-2">{day}</div>
        ))}
        {dayCells}
      </div>
    </div>
  );
};

// New Day Summary Modal to replace the old event modal
const DaySummaryModal = ({ isOpen, onClose, selectedDate, ticketsForDate }) => {
  if (!isOpen) return null;

  const completedTickets = ticketsForDate.filter(t => t.status === 'Closed');
  const pendingTickets = ticketsForDate.filter(t => t.status === 'Open');

  return createPortal(
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h3 className="text-2xl font-bold text-gray-800">PM Summary: {selectedDate?.toLocaleDateString()}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <div className="space-y-4">
          {ticketsForDate.length > 0 ? (
            <>
              <div className="flex justify-around text-center border-b pb-4">
                <div>
                  <div className="text-4xl font-bold text-green-500">{completedTickets.length}</div>
                  <div className="text-sm font-medium text-gray-600">Completed</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-red-500">{pendingTickets.length}</div>
                  <div className="text-sm font-medium text-gray-600">Pending</div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto pr-2">
                {ticketsForDate.map(ticket => (
                  <div
                    key={ticket.id}
                    className={`p-4 rounded-lg shadow-md text-white font-bold text-center flex items-center justify-center h-20 ${ticket.status === 'Open' ? 'bg-red-500' : 'bg-green-500'}`}
                  >
                    {ticket.assetId}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 italic">No PM tickets scheduled for this date.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};


// Modal for scheduling recurring PM events
const PMScheduleModal = ({ isOpen, onClose, onSavePmTickets, machines }) => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [frequency, setFrequency] = useState('monthly');
  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
  const [messageBoxMessage, setMessageBoxMessage] = useState('');

  // Get unique locations from the machines list
  const uniqueLocations = Array.from(new Set(machines.map(m => m.area)));
  // Filter machines based on the selected location
  const filteredMachines = machines.filter(m => m.area === selectedLocation);

  useEffect(() => {
    if (isOpen) {
      setSelectedLocation('');
      setSelectedMachines([]);
      setStartDate(new Date().toISOString().slice(0, 10));
      setEndDate(new Date().toISOString().slice(0, 10));
      setFrequency('monthly');
    }
  }, [isOpen]);

  // Find your existing handleSelectMachines function and replace it ENTIRELY with this:
const handleSelectMachines = (e) => { // <-- START REPLACE HERE
  const options = e.target.options;
  const selected = [];
  let allSelected = false;
  for (let i = 0; i < options.length; i++) {
    if (options[i].selected) {
      if (options[i].value === "ALL") {
        allSelected = true;
        break;
      }
      selected.push(options[i].value);
    }
  }
  if (allSelected) {
    setSelectedMachines(filteredMachines.map(m => m.id));
  } else {
    setSelectedMachines(selected);
  }
}; // <-- END REPLACE HERE

  const handleSave = () => {
    if (!selectedLocation || selectedMachines.length === 0 || !startDate || !endDate) {
      setMessageBoxMessage('Please select a location, at least one machine, a start date, and an end date.');
      setIsMessageBoxOpen(true);
      return;
    }

    const newPmTickets = [];

    // Create a PM ticket for each selected machine
    selectedMachines.forEach(machineId => {
      const asset = machines.find(m => m.id === machineId);
      newPmTickets.push({
        id: generateId(),
        title: `Preventive Maintenance: ${asset.assetNumber}`,
        scheduledDate: new Date(startDate).toISOString(),
        status: 'Open',
        assetId: asset.assetNumber,
        frequency,
      });
    });

    onSavePmTickets(newPmTickets);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h3 className="text-2xl font-bold text-gray-800">Schedule PM</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <div className="space-y-4">
          <label className="block">
            <span className="text-gray-700 font-medium">Location</span>
            <select
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setSelectedMachines([]); // Clear machines when location changes
              }}
            >
              <option value="">Select a Location</option>
              {uniqueLocations.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </label>

          {selectedLocation && (
            <div className="block">
              <span className="text-gray-700 font-medium">Select Machines (Ctrl + Click to select multiple)</span>
             <select // <-- START REPLACE HERE
  multiple
  size="6"
  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 max-h-40 overflow-y-auto"
  value={selectedMachines}
  onChange={handleSelectMachines}
>
  <option value="ALL">Select All</option>
  {filteredMachines.map(machine => (
    <option key={machine.id} value={machine.id}>
      {machine.machineName} ({machine.assetNumber})
    </option>
  ))}
</select> 
            </div>
          )}

          <label className="block">
            <span className="text-gray-700 font-medium">Start Date</span>
            <input
              type="date"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">End Date</span>
            <input
              type="date"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Frequency</span>
            <select
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>
          <button
            onClick={handleSave}
            className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Save PM Schedule</span>
          </button>
        </div>
      </div>
      <MessageBox
        isOpen={isMessageBoxOpen}
        onClose={() => setIsMessageBoxOpen(false)}
        title="Error"
        message={messageBoxMessage}
      />
    </div>,
    document.body
  );
};

// Modal for scheduling calibration events
const CalibrationScheduleModal = ({
  isOpen,
  onClose,
  onSaveCalibrationTickets,
  instruments
}) => {
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedInstruments, setSelectedInstruments] = useState([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [frequency, setFrequency] = useState('Monthly');
  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
  const [messageBoxMessage, setMessageBoxMessage] = useState('');

  // Get unique areas from the instrument master
  const uniqueAreas = Array.from(new Set(instruments.map(i => i.area)));
  // Filter instruments based on selected area
  const filteredInstruments = instruments.filter(i => i.area === selectedArea);

  useEffect(() => {
    if (isOpen) {
      setSelectedArea('');
      setSelectedInstruments([]);
      setStartDate(new Date().toISOString().slice(0, 10));
      setEndDate(new Date().toISOString().slice(0, 10));
      setFrequency('Monthly');
    }
  }, [isOpen]);

  const handleSelectInstruments = (e) => {
    const options = e.target.options;
    const selected = [];
    let allSelected = false;
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        if (options[i].value === "ALL") {
          allSelected = true;
          break;
        }
        selected.push(options[i].value);
      }
    }
    if (allSelected) {
      setSelectedInstruments(filteredInstruments.map(i => i.id));
    } else {
      setSelectedInstruments(selected);
    }
  };

  const handleSave = () => {
    if (!selectedArea || selectedInstruments.length === 0 || !startDate || !endDate) {
      setMessageBoxMessage('Please select an area, at least one instrument, a start date, and an end date.');
      setIsMessageBoxOpen(true);
      return;
    }

    const newCalibrationTickets = [];
    selectedInstruments.forEach(instrumentId => {
      const instrument = instruments.find(i => i.id === instrumentId);
      newCalibrationTickets.push({
        id: generateId(),
        title: `Calibration: ${instrument.instrumentNumber} - ${instrument.instrumentName}`,
        scheduledDate: new Date(startDate).toISOString(),
        status: 'Open',
        instrumentId: instrument.id,
        instrumentNumber: instrument.instrumentNumber,
        instrumentName: instrument.instrumentName,
        area: instrument.area,
        frequency: frequency,
        type: "Calibration"
      });
    });

    onSaveCalibrationTickets(newCalibrationTickets);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h3 className="text-2xl font-bold text-gray-800">Schedule Calibration</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <div className="space-y-4">
          <label className="block">
            <span className="text-gray-700 font-medium">Area</span>
            <select
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
              value={selectedArea}
              onChange={e => {
                setSelectedArea(e.target.value);
                setSelectedInstruments([]);
              }}
            >
              <option value="">Select Area</option>
              {uniqueAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </label>

          {selectedArea && (
            <div className="block">
              <span className="text-gray-700 font-medium">Select Instruments (Ctrl + Click to select multiple)</span>
              <select
                multiple
                size="6"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 max-h-40 overflow-y-auto"
                value={selectedInstruments}
                onChange={handleSelectInstruments}
              >
                <option value="ALL">Select All</option>
                {filteredInstruments.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.instrumentNumber} : {inst.instrumentName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="block">
            <span className="text-gray-700 font-medium">Start Date</span>
            <input
              type="date"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">End Date</span>
            <input
              type="date"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Frequency</span>
            <select
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </label>
          <button
            onClick={handleSave}
            className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-green-600 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Save Calibration Schedule</span>
          </button>
        </div>
      </div>
      <MessageBox
        isOpen={isMessageBoxOpen}
        onClose={() => setIsMessageBoxOpen(false)}
        title="Error"
        message={messageBoxMessage}
      />
    </div>,
    document.body
  );
};


// Placeholder component for the PM Schedules page
const PmsPage = ({ pmTickets }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-500';
      case 'Closed': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const completedTickets = pmTickets.filter(t => t.status === 'Closed');
  const pendingTickets = pmTickets.filter(t => t.status === 'Open');

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl mx-auto w-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">PM Ticket History</h2>

      {/* Summary section */}
      <div className="flex justify-around text-center border-b pb-4 mb-6">
        <div>
          <div className="text-4xl font-bold text-green-500">{completedTickets.length}</div>
          <div className="text-sm font-medium text-gray-600">Completed</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-red-500">{pendingTickets.length}</div>
          <div className="text-sm font-medium text-gray-600">Pending</div>
        </div>
      </div>

      {/* Ticket List */}
      <ul className="space-y-4">
        {pmTickets.length > 0 ? (
          pmTickets.map(ticket => (
              <li key={ticket.id} className="p-4 bg-gray-100 rounded-lg shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-gray-900">{ticket.title}</div>
                  <div className="text-sm text-gray-500">
                    Scheduled for: {new Date(ticket.scheduledDate).toLocaleDateString()}
                  </div>
                  {ticket.status === 'Closed' && (
                    <div className="text-sm text-gray-500">
                      Closed on: {new Date(ticket.closedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-white font-bold text-sm ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </div>
              </li>
            ))
        ) : (
          <p className="text-center text-gray-500 italic">No PM tickets found.</p>
        )}
      </ul>
    </div>
  );
};

// Component for User Master page
const UsersPage = ({ users, setUsers }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('Active'); // New state for user status
  const [role, setRole] = useState('User'); // New state for user role
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState(null);
  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!username || !password || !email || !phone) {
      setIsMessageBoxOpen(true);
      return;
    }
    const newUser = {
      id: generateId(),
      username,
      password,
      email,
      phone,
      status,
      role, // Include the new role field
    };
    setUsers([...users, newUser]);
    setUsername('');
    setPassword('');
    setEmail('');
    setPhone('');
    setStatus('Active');
    setRole('User');
    setIsFormExpanded(false);
  };

  const handleUpdateUser = () => {
    if (!editingUser.username || !editingUser.password || !editingUser.email || !editingUser.phone) {
      setIsMessageBoxOpen(true);
      return;
    }
    setUsers(users.map(user => user.id === editingUser.id ? editingUser : user));
    setIsEditModalOpen(false);
  };

  const handleDeleteUser = () => {
    setUsers(users.filter(user => user.id !== userToDeleteId));
    setIsConfirmModalOpen(false);
    setUserToDeleteId(null);
  };

  const openDeleteModal = (userId) => {
    setUserToDeleteId(userId);
    setIsConfirmModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl mx-auto w-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">User Master</h2>

      {/* Add User Form - now with expand/collapse functionality */}
      <div className="mb-8">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-700">Add New User</h3>
          <button
            onClick={() => setIsFormExpanded(!isFormExpanded)}
            className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
          >
            {isFormExpanded ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
        {isFormExpanded && (
          <form onSubmit={handleAddUser} className="space-y-4">
            <input
              type="text"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="email"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="tel"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
             <select
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option>Admin</option>
              <option>Viewer</option>
              <option>User</option>
            </select>
            <select
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              Add User
            </button>
          </form>
        )}
      </div>

      {/* User List */}
      <div className="border-t pt-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Existing Users</h3>
        <ul className="space-y-4">
          {users.length > 0 ? (
            users.map(user => (
              <li key={user.id} className="p-4 bg-gray-100 rounded-lg shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-gray-900">{user.username}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <div className="text-sm text-gray-500">Role: <span className={`font-medium ${user.role === 'Admin' ? 'text-blue-600' : 'text-gray-600'}`}>{user.role}</span></div>
                  <div className="text-sm text-gray-500">Status: <span className={`font-medium ${user.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{user.status}</span></div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(user)}
                    className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(user.id)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p className="text-center text-gray-500 italic">No users found.</p>
          )}
        </ul>
      </div>
      <MessageBox
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDeleteUser}
        title="Confirm Deletion"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
      <MessageBox
        isOpen={isMessageBoxOpen && !isEditModalOpen}
        onClose={() => setIsMessageBoxOpen(false)}
        title="Error"
        message="All fields are required to add a new user."
      />
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Edit User</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-gray-700 font-medium">Username</span>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-gray-700 font-medium">Password</span>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-gray-700 font-medium">Email</span>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-gray-700 font-medium">Phone Number</span>
                <input
                  type="tel"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-gray-700 font-medium">Role</span>
                <select
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                >
                  <option>Admin</option>
                  <option>Viewer</option>
                  <option>User</option>
                </select>
              </label>
              <label className="block">
                <span className="text-gray-700 font-medium">Status</span>
                <select
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <button
                onClick={handleUpdateUser}
                className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
          <MessageBox
            isOpen={isMessageBoxOpen}
            onClose={() => setIsMessageBoxOpen(false)}
            title="Error"
            message="All fields are required to update a user."
          />
        </div>
      )}
    </div>
  );
};


// Component for Machine Master page
const MachinesPage = ({ machines, setMachines }) => {
  const [machineId, setMachineId] = useState('');
  const [machineDescription, setMachineDescription] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [machineToDeleteId, setMachineToDeleteId] = useState(null);
  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [assetNumber, setAssetNumber] = useState('');
  const [machineName, setMachineName] = useState('');
  const [area, setArea] = useState('');
  const [status, setStatus] = useState('Active'); // New state for machine status
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  const handleAddMachine = (e) => {
    e.preventDefault();
    if (!assetNumber || !machineName || !area) {
      setIsMessageBoxOpen(true);
      return;
    }
    const newMachine = {
      id: generateId(),
      assetNumber,
      machineName,
      area,
      status, // Include the new status field
      description: machineDescription,
    };
    setMachines([...machines, newMachine]);
    setAssetNumber('');
    setMachineName('');
    setArea('');
    setMachineDescription('');
    setStatus('Active'); // Reset status to default
    setIsFormExpanded(false);
  };

  const handleUpdateMachine = () => {
    if (!editingMachine.assetNumber || !editingMachine.machineName || !editingMachine.area) {
      setIsMessageBoxOpen(true);
      return;
    }
    setMachines(machines.map(machine => machine.id === editingMachine.id ? editingMachine : machine));
    setIsEditModalOpen(false);
  };

  const handleDeleteMachine = () => {
    setMachines(machines.filter(machine => machine.id !== machineToDeleteId));
    setIsConfirmModalOpen(false);
    setMachineToDeleteId(null);
  };

  const openDeleteModal = (machineId) => {
    setMachineToDeleteId(machineId);
    setIsConfirmModalOpen(true);
  };

  const openEditModal = (machine) => {
    setEditingMachine({ ...machine });
    setIsEditModalOpen(true);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl mx-auto w-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Machine Master</h2>

      {/* Add Machine Form - now with expand/collapse functionality */}
      <div className="mb-8">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-700">Add New Machine</h3>
          <button
            onClick={() => setIsFormExpanded(!isFormExpanded)}
            className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
          >
            {isFormExpanded ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
        {isFormExpanded && (
          <form onSubmit={handleAddMachine} className="space-y-4">
            <input
              type="text"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
              placeholder="Asset Number"
              value={assetNumber}
              onChange={(e) => setAssetNumber(e.target.value)}
            />
            <input
              type="text"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
              placeholder="Machine Name"
              value={machineName}
              onChange={(e) => setMachineName(e.target.value)}
            />
            <input
              type="text"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
              placeholder="Area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
            <select
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <textarea
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
              placeholder="Description (Optional)"
              value={machineDescription}
              onChange={(e) => setMachineDescription(e.target.value)}
              rows="2"
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              Add Machine
            </button>
          </form>
        )}
      </div>

      {/* Machine List */}
      <div className="border-t pt-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Existing Machines</h3>
        <ul className="space-y-4">
          {machines.length > 0 ? (
            machines.map(machine => (
              <li key={machine.id} className="p-4 bg-gray-100 rounded-lg shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-gray-900">{machine.assetNumber} - {machine.machineName}</div>
                  <div className="text-sm text-gray-500">Area: {machine.area}</div>
                  <div className="text-sm text-gray-500">Status: <span className={`font-medium ${machine.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{machine.status}</span></div>
                  {machine.description && <div className="text-sm text-gray-500">{machine.description}</div>}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(machine)}
                    className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(machine.id)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p className="text-center text-gray-500 italic">No machines found.</p>
          )}
        </ul>
      </div>
      <MessageBox
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDeleteMachine}
        title="Confirm Deletion"
        message="Are you sure you want to delete this machine? This action cannot be undone."
      />
      <MessageBox
        isOpen={isMessageBoxOpen}
        onClose={() => setIsMessageBoxOpen(false)}
        title="Error"
        message="All fields are required to update a machine."
      />
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Edit Machine</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-gray-700 font-medium">Asset Number</span>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                  value={editingMachine.assetNumber}
                  onChange={(e) => setEditingMachine({ ...editingMachine, assetNumber: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-gray-700 font-medium">Machine Name</span>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                  value={editingMachine.machineName}
                  onChange={(e) => setEditingMachine({ ...editingMachine, machineName: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-gray-700 font-medium">Area</span>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                  value={editingMachine.area}
                  onChange={(e) => setEditingMachine({ ...editingMachine, area: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-gray-700 font-medium">Status</span>
                <select
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                  value={editingMachine.status}
                  onChange={(e) => setEditingMachine({ ...editingMachine, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <label className="block">
                <span className="text-gray-700 font-medium">Description</span>
                <textarea
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                  value={editingMachine.description}
                  onChange={(e) => setEditingMachine({ ...editingMachine, description: e.target.value })}
                  rows="2"
                />
              </label>
              <button
                onClick={handleUpdateMachine}
                className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
          <MessageBox
            isOpen={isMessageBoxOpen}
            onClose={() => setIsMessageBoxOpen(false)}
            title="Error"
            message="All fields are required to update a machine."
          />
        </div>
      )}
    </div>
  );
};


// --- NEW COMPONENT: Instrument Master Page ---
// --- InstrumentsPage (Instrument Master) with 2-column add & edit forms, field labels/tooltips ---
const InstrumentsPage = ({ instruments, setInstruments }) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [instrumentToDeleteId, setInstrumentToDeleteId] = useState(null);
  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
  const [messageBoxMessage, setMessageBoxMessage] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState(null);
  const [instrumentNumber, setInstrumentNumber] = useState('');
  const [instrumentName, setInstrumentName] = useState('');
  const [area, setArea] = useState('');
  const [status, setStatus] = useState('Active');
  const [description, setDescription] = useState('');
  const [lastCalibrationDone, setLastCalibrationDone] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  function calcNextDueDate(lastDate, freq) {
    if (!lastDate || !freq) return '';
    const date = new Date(lastDate);
    if (freq === 'Monthly') date.setMonth(date.getMonth() + 1);
    if (freq === 'Quarterly') date.setMonth(date.getMonth() + 3);
    if (freq === 'Yearly') date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().slice(0, 10);
  }

  useEffect(() => {
    setNextDueDate(calcNextDueDate(lastCalibrationDone, frequency));
  }, [lastCalibrationDone, frequency]);

  const handleAddInstrument = (e) => {
    e.preventDefault();
    if (!instrumentNumber || !instrumentName || !area) {
      setMessageBoxMessage('All fields are required to add a new instrument.');
      setIsMessageBoxOpen(true);
      return;
    }
    const newInstrument = {
      id: generateId(),
      instrumentNumber,
      instrumentName,
      area,
      status,
      description,
      lastCalibrationDone,
      frequency,
      nextDueDate,
    };
    setInstruments([...instruments, newInstrument]);
    setInstrumentNumber('');
    setInstrumentName('');
    setArea('');
    setDescription('');
    setStatus('Active');
    setLastCalibrationDone('');
    setFrequency('Monthly');
    setNextDueDate('');
    setIsFormExpanded(false);
  };

  useEffect(() => {
    if (isEditModalOpen && editingInstrument) {
      setEditingInstrument((prev) => ({
        ...prev,
        nextDueDate: calcNextDueDate(prev.lastCalibrationDone, prev.frequency)
      }));
    }
    // eslint-disable-next-line
  }, [isEditModalOpen, editingInstrument?.lastCalibrationDone, editingInstrument?.frequency]);

  const handleUpdateInstrument = () => {
    if (!editingInstrument.instrumentNumber || !editingInstrument.instrumentName || !editingInstrument.area) {
      setMessageBoxMessage('All fields are required to update an instrument.');
      setIsMessageBoxOpen(true);
      return;
    }
    setInstruments(instruments.map(instrument => instrument.id === editingInstrument.id ? editingInstrument : instrument));
    setIsEditModalOpen(false);
  };

  const handleDeleteInstrument = () => {
    setInstruments(instruments.filter(instrument => instrument.id !== instrumentToDeleteId));
    setIsConfirmModalOpen(false);
    setInstrumentToDeleteId(null);
  };

  const openDeleteModal = (instrumentId) => {
    setInstrumentToDeleteId(instrumentId);
    setIsConfirmModalOpen(true);
  };

  const openEditModal = (instrument) => {
    setEditingInstrument({ ...instrument });
    setIsEditModalOpen(true);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl mx-auto w-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Instrument Master</h2>

      {/* Add Instrument Form */}
      <div className="mb-8">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-700">Add New Instrument</h3>
          <button
            onClick={() => setIsFormExpanded(!isFormExpanded)}
            className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
            aria-label={isFormExpanded ? "Collapse form" : "Expand form"}
          >
            {isFormExpanded ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
        {isFormExpanded && (
          <form onSubmit={handleAddInstrument} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Row 1: Instrument Number & Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="instrumentNumber" title="Unique number to identify the instrument">
                Instrument Number
              </label>
              <input
                id="instrumentNumber"
                type="text"
                className="block w-full rounded-lg border-gray-300 shadow-sm p-3"
                placeholder="e.g. I-101"
                value={instrumentNumber}
                onChange={(e) => setInstrumentNumber(e.target.value)}
                title="Unique number to identify the instrument"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="instrumentName" title="Name of the instrument">
                Instrument Name
              </label>
              <input
                id="instrumentName"
                type="text"
                className="block w-full rounded-lg border-gray-300 shadow-sm p-3"
                placeholder="e.g. Pressure Gauge"
                value={instrumentName}
                onChange={(e) => setInstrumentName(e.target.value)}
                title="Name of the instrument"
              />
            </div>
            {/* Row 2: Area & Status */}
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="area" title="Physical area or department">
                Area
              </label>
              <input
                id="area"
                type="text"
                className="block w-full rounded-lg border-gray-300 shadow-sm p-3"
                placeholder="e.g. Assembly Floor"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                title="Physical area or department"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="status" title="Select instrument status">
                Status
              </label>
              <select
                id="status"
                className="block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                title="Select instrument status"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            {/* Row 3: Description & Frequency */}
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="description" title="Short description or notes">
                Description
              </label>
              <textarea
                id="description"
                className="block w-full rounded-lg border-gray-300 shadow-sm p-3"
                placeholder="Description (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="2"
                title="Short description or notes"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="frequency" title="Calibration frequency">
                Frequency
              </label>
              <select
                id="frequency"
                className="block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                title="Calibration frequency"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
            {/* Row 4: Last Calibration & Next Due Date */}
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="lastCalibrationDone" title="Date of last calibration performed">
                Last Calibration Done
              </label>
              <input
                id="lastCalibrationDone"
                type="date"
                className="block w-full rounded-lg border-gray-300 shadow-sm p-3"
                placeholder="Last Calibration Done"
                value={lastCalibrationDone}
                onChange={(e) => setLastCalibrationDone(e.target.value)}
                title="Date of last calibration performed"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="nextDueDate" title="Next calibration due date (auto)">
                Next Due Date
              </label>
              <input
                id="nextDueDate"
                type="date"
                className="block w-full rounded-lg border-gray-300 bg-gray-100 text-gray-400 shadow-sm p-3 cursor-not-allowed"
                placeholder="Next Due Date"
                value={nextDueDate}
                disabled
                title="Next calibration due date (auto-calculated)"
              />
            </div>
            {/* Submit Button, full width */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                Add Instrument
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Instrument List */}
      <div className="border-t pt-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Existing Instruments</h3>
        <ul className="space-y-4">
          {instruments.length > 0 ? (
            instruments.map(instrument => (
              <li key={instrument.id} className="p-4 bg-gray-100 rounded-lg shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-gray-900">{instrument.instrumentNumber} - {instrument.instrumentName}</div>
                  <div className="text-sm text-gray-500">Area: {instrument.area}</div>
                  <div className="text-sm text-gray-500">Status: <span className={`font-medium ${instrument.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{instrument.status}</span></div>
                  {instrument.description && <div className="text-sm text-gray-500">{instrument.description}</div>}
                  <div className="text-sm text-gray-500">Frequency: {instrument.frequency || '-'}</div>
                  <div className="text-sm text-gray-500">Last Calibration Done: {instrument.lastCalibrationDone || '-'}</div>
                  <div className="text-sm text-gray-500">Next Due Date: {instrument.nextDueDate || calcNextDueDate(instrument.lastCalibrationDone, instrument.frequency) || '-'}</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(instrument)}
                    className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
                    title="Edit Instrument"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(instrument.id)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                    title="Delete Instrument"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p className="text-center text-gray-500 italic">No instruments found.</p>
          )}
        </ul>
      </div>
      <MessageBox
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDeleteInstrument}
        title="Confirm Deletion"
        message="Are you sure you want to delete this instrument? This action cannot be undone."
      />
      <MessageBox
        isOpen={isMessageBoxOpen && !isEditModalOpen}
        onClose={() => setIsMessageBoxOpen(false)}
        title="Error"
        message={messageBoxMessage}
      />
      {isEditModalOpen && editingInstrument && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Edit Instrument</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            {/* 2-column grid form for editing */}
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Row 1: Instrument Number & Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="edit-instrumentNumber" title="Unique number to identify the instrument">
                  Instrument Number
                </label>
                <input
                  id="edit-instrumentNumber"
                  type="text"
                  className="block w-full rounded-lg border-gray-300 shadow-sm p-3"
                  value={editingInstrument.instrumentNumber}
                  onChange={(e) => setEditingInstrument({ ...editingInstrument, instrumentNumber: e.target.value })}
                  title="Unique number to identify the instrument"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="edit-instrumentName" title="Name of the instrument">
                  Instrument Name
                </label>
                <input
                  id="edit-instrumentName"
                  type="text"
                  className="block w-full rounded-lg border-gray-300 shadow-sm p-3"
                  value={editingInstrument.instrumentName}
                  onChange={(e) => setEditingInstrument({ ...editingInstrument, instrumentName: e.target.value })}
                  title="Name of the instrument"
                />
              </div>
              {/* Row 2: Area & Status */}
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="edit-area" title="Physical area or department">
                  Area
                </label>
                <input
                  id="edit-area"
                  type="text"
                  className="block w-full rounded-lg border-gray-300 shadow-sm p-3"
                  value={editingInstrument.area}
                  onChange={(e) => setEditingInstrument({ ...editingInstrument, area: e.target.value })}
                  title="Physical area or department"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="edit-status" title="Select instrument status">
                  Status
                </label>
                <select
                  id="edit-status"
                  className="block w-full rounded-lg border-gray-300 shadow-sm p-3"
                  value={editingInstrument.status}
                  onChange={(e) => setEditingInstrument({ ...editingInstrument, status: e.target.value })}
                  title="Select instrument status"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              {/* Row 3: Description & Frequency */}
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="edit-description" title="Short description or notes">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  className="block w-full rounded-lg border-gray-300 shadow-sm p-3"
                  value={editingInstrument.description}
                  onChange={(e) => setEditingInstrument({ ...editingInstrument, description: e.target.value })}
                  rows="2"
                  title="Short description or notes"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="edit-frequency" title="Calibration frequency">
                  Frequency
                </label>
                <select
                  id="edit-frequency"
                  className="block w-full rounded-lg border-gray-300 shadow-sm p-3"
                  value={editingInstrument.frequency || 'Monthly'}
                  onChange={(e) => setEditingInstrument({ ...editingInstrument, frequency: e.target.value })}
                  title="Calibration frequency"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              {/* Row 4: Last Calibration & Next Due Date */}
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="edit-lastCalibrationDone" title="Date of last calibration performed">
                  Last Calibration Done
                </label>
                <input
                  id="edit-lastCalibrationDone"
                  type="date"
                  className="block w-full rounded-lg border-gray-300 shadow-sm p-3"
                  value={editingInstrument.lastCalibrationDone || ''}
                  onChange={(e) => setEditingInstrument({ ...editingInstrument, lastCalibrationDone: e.target.value })}
                  title="Date of last calibration performed"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="edit-nextDueDate" title="Next calibration due date (auto)">
                  Next Due Date
                </label>
                <input
                  id="edit-nextDueDate"
                  type="date"
                  className="block w-full rounded-lg border-gray-300 bg-gray-100 text-gray-400 shadow-sm p-3 cursor-not-allowed"
                  value={editingInstrument.nextDueDate || calcNextDueDate(editingInstrument.lastCalibrationDone, editingInstrument.frequency) || ''}
                  disabled
                  title="Next calibration due date (auto-calculated)"
                />
              </div>
              {/* Submit button (full width) */}
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={handleUpdateInstrument}
                  className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
          <MessageBox
            isOpen={isMessageBoxOpen}
            onClose={() => setIsMessageBoxOpen(false)}
            title="Error"
            message={messageBoxMessage}
          />
        </div>
      )}
    </div>
  );
};

// NEW Component for logged-in users to close a breakdown ticket
const BreakdownTicketFormLoggedIn = ({ ticket, machines, currentUser, onSave, onGoBack }) => {
  // State for form inputs, pre-filled with the ticket data
  const [ticketData, setTicketData] = useState(ticket);
  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
  const [messageBoxMessage, setMessageBoxMessage] = useState('');

  // Find the location of the selected machine to set the location dropdown
  const machine = machines.find(m => m.id === ticketData.machineId);
  const [location, setLocation] = useState(machine?.area || '');

  // Calculate downtime whenever "from" or "to" fields change
  useEffect(() => {
    if (ticketData.downtimeFrom && ticketData.downtimeTo) {
      const from = new Date(ticketData.downtimeFrom);
      const to = new Date(ticketData.downtimeTo);
      const diffInMs = to.getTime() - from.getTime();

      if (diffInMs < 0) {
        setTicketData(prev => ({...prev, totalDowntime: 'Invalid time'}));
        return;
      }

      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      setTicketData(prev => ({...prev, totalDowntime: `${hours} hours ${minutes} minutes`}));
    } else {
      setTicketData(prev => ({...prev, totalDowntime: '0 hours 0 minutes'}));
    }
  }, [ticketData.downtimeFrom, ticketData.downtimeTo]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Final validation
    if (!ticketData.shift || !ticketData.downtimeFrom || !ticketData.downtimeTo || !ticketData.machineId || !ticketData.problemObserved || !ticketData.correctiveAction) {
      setMessageBoxMessage('Please fill out all required fields before closing the ticket.');
      setIsMessageBoxOpen(true);
      return;
    }

    // Update the ticket status and attended by
    const closedTicket = {
      ...ticketData,
      status: 'Closed',
      closedDate: new Date().toISOString(),
      attendedBy: currentUser, // Set the current user as the attendee
    };
    onSave(closedTicket);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Close Breakdown Ticket</h2>
          <button
            onClick={onGoBack}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors flex items-center space-x-1"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">Work Details</h3>
            <label className="block">
              <span className="text-gray-700 font-medium flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Date of Work</span>
              </span>
              <input
                type="date"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={new Date(ticketData.dateOfWork).toISOString().slice(0, 10)}
                onChange={(e) => setTicketData(prev => ({ ...prev, dateOfWork: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium flex items-center space-x-2">
                <Tag className="w-5 h-5" />
                <span>Shift</span>
              </span>
              <select
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={ticketData.shift}
                onChange={(e) => setTicketData(prev => ({ ...prev, shift: e.target.value }))}
              >
                <option>First</option>
                <option>Second</option>
                <option>Night</option>
              </select>
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Downtime From</span>
              </span>
              <input
                type="datetime-local"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={ticketData.downtimeFrom.slice(0, 16)} // Slice to match datetime-local format
                onChange={(e) => setTicketData(prev => ({ ...prev, downtimeFrom: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Downtime To</span>
              </span>
              <input
                type="datetime-local"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={ticketData.downtimeTo ? ticketData.downtimeTo.slice(0, 16) : ''}
                onChange={(e) => setTicketData(prev => ({ ...prev, downtimeTo: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Total Downtime</span>
              </span>
              <input
                type="text"
                className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed shadow-sm p-3"
                value={ticketData.totalDowntime}
                disabled
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Material Required</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={ticketData.materialRequired}
                onChange={(e) => setTicketData(prev => ({ ...prev, materialRequired: e.target.value }))}
              />
            </label>
            <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Attended By:</span>
                <span className="text-gray-700 font-semibold">{currentUser}</span>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">Problem Details</h3>
            <label className="block">
              <span className="text-gray-700 font-medium">Type of Work</span>
              <select
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={ticketData.type}
                onChange={(e) => setTicketData(prev => ({ ...prev, type: e.target.value }))}
              >
                <option>Breakdown</option>
                <option>Other Work</option>
              </select>
            </label>
             <label className="block">
              <span className="text-gray-700 font-medium">Location</span>
              <select
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setTicketData(prev => ({ ...prev, machineId: '' }))
                }}
              >
                <option value="">Select a Location</option>
                {Array.from(new Set(machines.map(m => m.area))).map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Machine Name</span>
              <select
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={ticketData.machineId}
                onChange={(e) => setTicketData(prev => ({ ...prev, machineId: e.target.value }))}
                disabled={!location}
              >
                <option value="">Select a Machine</option>
                {machines.filter(m => m.area === location).map(m => (
                  <option key={m.id} value={m.id}>{m.machineName}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Problem Observed</span>
              <textarea
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={ticketData.problemObserved}
                onChange={(e) => setTicketData(prev => ({ ...prev, problemObserved: e.target.value }))}
                rows="4"
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Corrective Action</span>
              <textarea
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={ticketData.correctiveAction}
                onChange={(e) => setTicketData(prev => ({ ...prev, correctiveAction: e.target.value }))}
                rows="2"
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Material Replaced</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={ticketData.materialReplaced}
                onChange={(e) => setTicketData(prev => ({ ...prev, materialReplaced: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Remark</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={ticketData.remark}
                onChange={(e) => setTicketData(prev => ({ ...prev, remark: e.target.value }))}
              />
            </label>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-green-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-green-600 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <CheckSquare className="w-5 h-5" />
              <span>Close Ticket</span>
            </button>
          </div>
        </form>
      </div>
      <MessageBox
        isOpen={isMessageBoxOpen}
        onClose={() => setIsMessageBoxOpen(false)}
        title="Form Validation"
        message={messageBoxMessage}
      />
    </div>
  );
};
const BreakdownTicketFormAnonymous = ({ machines, onCreateTicket, onGoBack }) => {
  // State for form inputs
  const [shift, setShift] = useState('First');
  const [downtimeFrom, setDowntimeFrom] = useState('');
  const [downtimeTo, setDowntimeTo] = useState('');
  const [totalDowntime, setTotalDowntime] = useState('0 hours 0 minutes');
  const [typeOfWork, setTypeOfWork] = useState('Breakdown');
  const [machineId, setMachineId] = useState('');
  const [location, setLocation] = useState('');
  const [problemObserved, setProblemObserved] = useState('');
  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
  const [messageBoxMessage, setMessageBoxMessage] = useState('');
  // Get a list of unique locations
  const uniqueLocations = Array.from(new Set(machines.map(m => m.area)));

  // Filter machines based on selected location
  const filteredMachines = machines.filter(m => m.area === location);
 
  
useEffect(() => {
  const now = new Date();
  const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16); // Format: 'YYYY-MM-DDTHH:mm'
  setDowntimeFrom(localISOTime);
}, []);

  // Calculate downtime whenever "from" or "to" fields change
  useEffect(() => {
    if (downtimeFrom && downtimeTo) {
      const from = new Date(downtimeFrom);
      const to = new Date(downtimeTo);
      const diffInMs = to.getTime() - from.getTime();
      
      if (diffInMs < 0) {
        setTotalDowntime('Invalid time');
        return;
      }

      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      setTotalDowntime(`${hours} hours ${minutes} minutes`);
    } else {
      setTotalDowntime('0 hours 0 minutes');
    }
  }, [downtimeFrom, downtimeTo]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic form validation for anonymous users
    if (!shift || !downtimeFrom ||  !machineId || !problemObserved) {
      setMessageBoxMessage('Please fill out all required fields.');
      setIsMessageBoxOpen(true);
      return;
    }
// Create new ticket object
    const ticketData = {
      id: generateId(),
      type: typeOfWork,
      title: `${typeOfWork}: ${machines.find(m => m.id === machineId)?.machineName}`,
      dateOfWork: new Date().toISOString(),
      shift,
      downtimeFrom:new Date().toISOString().slice(0, 16),
      downtimeTo,
      totalDowntime,
      machineId,
      location,
      problemObserved,
      status: 'Open',
      // Fields for logged-in users, left blank for anonymous
      materialRequired: '',
      attendedBy: 'Anonymous',
      correctiveAction: '',
      materialReplaced: '',
      remark: '',
    };
    
    onCreateTicket(ticketData);
    // Reset form fields
    setShift('First');
    setDowntimeFrom('');
    setDowntimeTo('');
    setTypeOfWork('Breakdown');
    setMachineId('');
    setLocation('');
    setProblemObserved('');
    
    setMessageBoxMessage('Ticket submitted successfully! You will be redirected to the main page.');
    setIsMessageBoxOpen(true);

    setTimeout(() => {
        onGoBack(); // Redirect back to the login page
    }, 2000);
    
  };
const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Report a Breakdown</h2>
          <button
            onClick={onGoBack}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors flex items-center space-x-1"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">Work Details</h3>
            <label className="block">
              <span className="text-gray-700 font-medium">Date of Work</span>
              <input
                type="date"
                className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed shadow-sm p-3"
                value={today}
                disabled
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Shift</span>
              <select
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
              >
                <option>First</option>
                <option>Second</option>
                <option>Night</option>
              </select>
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Downtime From</span>
              <input
                type="datetime-local"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={downtimeFrom}
                onChange={(e) => setDowntimeFrom(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Downtime To</span>
              <input
                type="datetime-local"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={downtimeTo}
                onChange={(e) => setDowntimeTo(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Total Downtime</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed shadow-sm p-3"
                value={totalDowntime}
                disabled
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Material Required</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed shadow-sm p-3"
                value="N/A"
                disabled
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Attended By</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed shadow-sm p-3"
                value="Anonymous"
                disabled
              />
            </label>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">Problem Details</h3>
            <label className="block">
              <span className="text-gray-700 font-medium">Type of Work</span>
              <select
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={typeOfWork}
                onChange={(e) => setTypeOfWork(e.target.value)}
              >
                <option>Breakdown</option>
                <option>Other Work</option>
              </select>
            </label>
             <label className="block">
              <span className="text-gray-700 font-medium">Location</span>
              <select
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setMachineId(''); // Reset machineId when location changes
                }}
              >
                <option value="">Select a Location</option>
                {uniqueLocations.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Machine Name</span>
              <select
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                disabled={!location}
              >
                <option value="">Select a Machine</option>
                {filteredMachines.map(m => (
                  <option key={m.id} value={m.id}>{m.machineName}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Problem Observed</span>
              <textarea
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3"
                value={problemObserved}
                onChange={(e) => setProblemObserved(e.target.value)}
                rows="4"
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Corrective Action</span>
              <textarea
                className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed shadow-sm p-3"
                value="N/A"
                disabled
                rows="2"
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Material Replaced</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed shadow-sm p-3"
                value="N/A"
                disabled
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Remark</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed shadow-sm p-3"
                value="N/A"
                disabled
              />
            </label>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Submit Breakdown Ticket</span>
            </button>
          </div>
        </form>
      </div>
      <MessageBox
        isOpen={isMessageBoxOpen}
        onClose={() => setIsMessageBoxOpen(false)}
        title="Form Submission"
        message={messageBoxMessage}
      />
    </div>
  );
};


// Component for the new Tickets page with tabs
const TicketsPage = ({ tickets, pmTickets, calibrationTickets, onClosePmTicket,onCloseCalibrationTicket, onEditBreakdownTicket }) => {
  const [activeTab, setActiveTab] = useState('breakdown');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // A helper function to get the status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-500';
      case 'Closed': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const handleCloseTicket = (ticketId, frequency, assetId) => {
    onClosePmTicket(ticketId, frequency, assetId);
    setNotificationMessage(`Ticket for ${assetId} closed! A new one has been scheduled.`);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      setNotificationMessage('');
    }, 3000); // Hide the notification after 3 seconds
  };

const handleCloseCalibration = (ticketId, frequency, instrumentId, instrumentName) => {
  onCloseCalibrationTicket(ticketId, frequency, instrumentId, instrumentName);
  setNotificationMessage(`Calibration ticket for ${instrumentId} closed! A new one has been scheduled.`);
  setShowNotification(true);
  setTimeout(() => {
    setShowNotification(false);
    setNotificationMessage('');
  }, 3000);
};


  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl mx-auto w-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Tickets</h2>

      {/* Tab Navigation */}
      <div className="flex mb-6 border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab('breakdown')}
          className={`p-4 font-semibold text-lg transition-colors duration-200 flex items-center space-x-2 ${activeTab === 'breakdown' ? 'text-blue-500 border-b-4 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Wrench className="w-5 h-5" />
          <span>Breakdown Tickets</span>
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`p-4 font-semibold text-lg transition-colors duration-200 flex items-center space-x-2 ${activeTab === 'maintenance' ? 'text-blue-500 border-b-4 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Ticket className="w-5 h-5" />
          <span>Maintenance Tickets</span>
        </button>
          <button
  onClick={() => setActiveTab('calibration')}
  className={`p-4 font-semibold text-lg transition-colors duration-200 flex items-center space-x-2 ${
    activeTab === 'calibration'
      ? 'text-blue-500 border-b-4 border-blue-500'
      : 'text-gray-500 hover:text-gray-700'
  }`}
>
  Calibration Tickets
</button>

      </div>
      {/* Content based on active tab */}
{activeTab === 'breakdown' && (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold text-gray-700">Open Breakdown Tickets</h3>
    {tickets.length > 0 ? (
      tickets.map(ticket => (
<li
  key={ticket.id}
  className="list-none p-4 bg-gray-100 rounded-lg shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-200"
  onClick={() => console.log('Clicked ticket:', ticket)}
>

          <div>
            <div className="text-lg font-semibold text-gray-900">{ticket.title}</div>
            <div className="text-sm text-gray-500">Assigned to: {ticket.attendedBy}</div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-white font-bold text-sm ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </div>
            {/* The new "Close" button for breakdown tickets */}
            {ticket.status === 'Open' && (
              <button
                onClick={() => onEditBreakdownTicket(ticket)}
                className="p-2 text-green-500 hover:bg-green-100 rounded-full transition-colors"
              >
                <CheckSquare className="w-5 h-5" />
              </button>
            )}
          </div>
        </li>
      ))
    ) : (
      <p className="text-center text-gray-500 italic">No breakdown tickets found.</p>
    )}
  </div>
)}

{activeTab === 'maintenance' && (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold text-gray-700">Open Maintenance Tickets</h3>
    {pmTickets.filter(t => t.status === 'Open').length > 0 ? (
      pmTickets.filter(t => t.status === 'Open').map(ticket => (
        <li key={ticket.id} className="list-none p-4 bg-gray-100 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">{ticket.title}</div>
            <div className="text-sm text-gray-500">Scheduled for: {new Date(ticket.scheduledDate).toLocaleDateString()}</div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-white font-bold text-sm ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </div>
            {ticket.status === 'Open' && (
              <button
                onClick={() => handleCloseTicket(ticket.id, ticket.frequency, ticket.assetId)}
                className="p-2 text-green-500 hover:bg-green-100 rounded-full transition-colors"
              >
                <CheckSquare className="w-5 h-5" />
              </button>
            )}
          </div>
        </li>
      ))
    ) : (
      <p className="text-center text-gray-500 italic">No open maintenance tickets found.</p>
    )}
  </div>
)}

{activeTab === 'calibration' && (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold text-gray-700">Open Calibration Tickets</h3>
    {calibrationTickets.filter(t => t.status === 'Open').length > 0 ? (
      calibrationTickets
        .filter(t => t.status === 'Open')
        .map(ticket => (
          <li key={ticket.id} className="list-none p-4 bg-gray-100 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-gray-900">{ticket.title}</div>
              <div className="text-sm text-gray-500">
                Scheduled for: {new Date(ticket.scheduledDate).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-500">
                Instrument: {ticket.instrumentNumber} - {ticket.instrumentName}
              </div>
              <div className="text-sm text-gray-500">Area: {ticket.area}</div>
            </div>
            <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-white font-bold text-sm ${getStatusColor(ticket.status)}`}>
            {ticket.status}
           </div>
  {ticket.status === 'Open' && (
    <button
      onClick={() =>
        handleCloseCalibration(ticket.id, ticket.frequency, ticket.instrumentNumber, ticket.instrumentName)
      }
      className="p-2 text-green-500 hover:bg-green-100 rounded-full transition-colors"
    >
      <CheckSquare className="w-5 h-5" />
    </button>
  )}
</div>

          </li>
        ))
    ) : (
      <p className="text-center text-gray-500 italic">No open calibration tickets found.</p>
    )}
  </div>
)}

      

      {/* Notification Toast */}
      {showNotification && createPortal(
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 z-50">
          <p className="text-sm font-semibold">{notificationMessage}</p>
        </div>,
        document.body
      )}
    </div>
  );
};

// Placeholder component for the Settings page
const SettingsPage = () => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl mx-auto w-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Settings</h2>
      <p className="text-lg text-gray-600">
        This page is a placeholder for future settings functionality.
      </p>
    </div>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null); // New state for user role
  const [currentPage, setCurrentPage] = useState('tickets');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calibrationTickets, setCalibrationTickets] = useState([]);
  const [tickets, setTickets] = useState([
    {
      id: generateId(),
      title: 'Machine A - Urgent Repair',
      type: 'Breakdown',
      status: 'Open',
      attendedBy: 'John Doe',
      dateOfWork: new Date().toISOString(),
      shift: 'First',
      downtimeFrom: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      downtimeTo: new Date().toISOString(),
      totalDowntime: '1 hour 0 minutes',
      machineId: 'm1',
      location: 'Assembly Floor',
      problemObserved: 'Machine A is making a grinding noise and has stopped working.',
      materialRequired: '',
      correctiveAction: '',
      materialReplaced: '',
      remark: ''
    },
    { id: generateId(), title: 'HVAC System Maintenance', type: 'Other Work', status: 'In Progress', attendedBy: 'Jane Smith' },
    { id: generateId(), title: 'Lighting in Warehouse B', type: 'Breakdown', status: 'Open', attendedBy: 'John Doe' },
  ]);
  const [pmTickets, setPmTickets] = useState([]);
  const [users, setUsers] = useState([
    { id: generateId(), username: 'user2', password: 'user123', email: 'user2@example.com', phone: '555-555-5555', status: 'Active', role: 'User' }
  ]);
  const [machines, setMachines] = useState([
    { id: 'm1', assetNumber: 'M-001', machineName: 'Main Production Line', area: 'Assembly Floor', status: 'Active', description: 'Main production line machine' },
    { id: 'm2', assetNumber: 'M-002', machineName: 'Packaging Unit', area: 'Packing Section', status: 'Active', description: 'Packaging unit' },
    { id: 'm3', assetNumber: 'M-003', machineName: 'Conveyor Belt', area: 'Packing Section', status: 'Active', description: 'Conveyor belt for packaging' },
    { id: 'm4', assetNumber: 'M-004', machineName: 'Mixing Tank', area: 'Assembly Floor', status: 'Active', description: 'Large mixing tank' },
  ]);
  // --- INSTRUMENTS STATE --- (UPDATED)
const [instruments, setInstruments] = useState([
  { id: 'i1', instrumentNumber: 'I-101', instrumentName: 'Pressure Gauge', area: 'Assembly Floor', status: 'Active', description: 'Measures pressure in tank', lastCalibrationDone: '' },
  { id: 'i2', instrumentNumber: 'I-102', instrumentName: 'Temperature Sensor', area: 'Packing Section', status: 'Active', description: 'Monitors temperature', lastCalibrationDone: '' },
]);
  const [isPmModalOpen, setIsPmModalOpen] = useState(false);
  const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState(false); // [Schedule Calibration Button] ADD THIS LINE
  // Handler for saving calibration tickets

const handleSaveCalibrationTickets = (newCalibrationTickets) => {
  setCalibrationTickets(prev => [...prev, ...newCalibrationTickets]);
};

  const [isDaySummaryModal, setIsDaySummaryModal] = useState(false);
  const [selectedDateTickets, setSelectedDateTickets] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);

  const handlePrevMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
  };

  const handleDayClick = (date, ticketsForDate) => {
    setSelectedDate(date);
    setSelectedDateTickets(ticketsForDate);
    setIsDaySummaryModal(true);
  };

  const handleSavePmTickets = (newPmTickets) => {
    setPmTickets(prevTickets => [...prevTickets, ...newPmTickets]);
  };

  const handleClosePmTicket = (ticketId, frequency, assetId) => {
    const closedDate = new Date();
    const ticket = pmTickets.find(t => t.id === ticketId);
    
  if (new Date(ticket.scheduledDate) > closedDate) {
    alert("You cannot close a PM ticket scheduled for a future date.");
    return;
  }


    setPmTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === ticketId ? { ...ticket, status: 'Closed', closedDate: closedDate.toISOString() } : ticket
      )
    );

    const nextScheduledDate = new Date(closedDate);
    if (frequency === 'weekly') {
      nextScheduledDate.setDate(closedDate.getDate() + 7);
    } else if (frequency === 'monthly') {
      nextScheduledDate.setMonth(closedDate.getMonth() + 1);
    } else if (frequency === 'yearly') {
      nextScheduledDate.setFullYear(closedDate.getFullYear() + 1);
    }

    const newPmTicket = {
      id: generateId(),
      title: `Preventive Maintenance: ${assetId}`,
      scheduledDate: nextScheduledDate.toISOString(),
      status: 'Open',
      assetId,
      frequency,
    };

    setPmTickets(prevTickets => [...prevTickets, newPmTicket]);
  };

  const handleAddTicket = (newTicket) => {
      setTickets(prevTickets => [...prevTickets, newTicket]);
  };

  const handleEditBreakdownTicket = (ticket) => {
    setEditingTicket(ticket);
    setCurrentPage('edit-breakdown-ticket');
  };

  const handleCloseBreakdownTicket = (updatedTicket) => {
    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    );
    setEditingTicket(null);
    setCurrentPage('tickets');
  };
const handleCloseCalibrationTicket = (ticketId, frequency, instrumentId, instrumentName) => {
  const closedDate = new Date();
  
const ticket = calibrationTickets.find(t => t.id === ticketId);
if (new Date(ticket.scheduledDate) > closedDate) {
  alert("You cannot close a calibration ticket scheduled for a future date.");
  return;
}

  
  setCalibrationTickets(prevTickets =>
    prevTickets.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, status: 'Closed', closedDate: closedDate.toISOString() }
        : ticket
    )
  );

  const nextScheduledDate = new Date(closedDate);
  if (frequency === 'Monthly') nextScheduledDate.setMonth(closedDate.getMonth() + 1);
  else if (frequency === 'Quarterly') nextScheduledDate.setMonth(closedDate.getMonth() + 3);
  else if (frequency === 'Yearly') nextScheduledDate.setFullYear(closedDate.getFullYear() + 1);

  const newTicket = {
    id: generateId(),
    title: `Calibration: ${instrumentId} - ${instrumentName}`,
    scheduledDate: nextScheduledDate.toISOString(),
    status: 'Open',
    instrumentId,
    instrumentNumber: instrumentId,
    instrumentName,
    area: '', // Optional: fill if available
    frequency,
    type: 'Calibration',
  };

  setCalibrationTickets(prev => [...prev, newTicket]);
};



          
  const handleLogin = (username, role) => {
      setIsLoggedIn(true);
      setCurrentUser(username);
      setCurrentUserRole(role); // Set the new user role state
      setCurrentPage('tickets');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentUserRole(null); // Clear the user role on logout
    setCurrentPage('login'); // Redirect to login page on logout
  };

  const renderPage = () => {
    if (currentPage === 'anonymous-form') {
      
    return (
    <BreakdownTicketFormAnonymous
      machines={machines}
      onCreateTicket={handleAddTicket}
      onGoBack={() => setCurrentPage('login')}
    />
  );

    }

    if (currentPage === 'edit-breakdown-ticket' && editingTicket) {
      return <BreakdownTicketFormLoggedIn ticket={editingTicket} machines={machines} currentUser={currentUser} onSave={handleCloseBreakdownTicket} onGoBack={() => setCurrentPage('tickets')} />;
    }

    switch (currentPage) {
      case 'calendar':
  return (
    <>
      <CalendarComponent
        pmTickets={pmTickets}
        currentMonth={currentDate.getMonth()}
        currentYear={currentDate.getFullYear()}
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
        onDayClick={handleDayClick}
      />
      <div className="flex flex-row">
        <button
          onClick={() => setIsPmModalOpen(true)}
          className="mt-8 bg-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-600 transition-all duration-200 flex items-center space-x-2"
        >
          <Calendar className="w-5 h-5" />
          <span>Schedule PM</span>
        </button>
        {/* [Schedule Calibration Button] BEGIN */}
        <button
          onClick={() => setIsCalibrationModalOpen(true)}
          className="mt-8 ml-4 bg-green-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-green-600 transition-all duration-200 flex items-center space-x-2"
        >
          <Calendar className="w-5 h-5" />
          <span>Schedule Calibration</span>
        </button>
        {/* [Schedule Calibration Button] END */}
      </div>
    </>
  );

// 3. Add this (or similar) where you render modals, near your PMScheduleModal

{isCalibrationModalOpen && (
  // [Schedule Calibration Modal Placeholder]
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
      <h3 className="text-2xl font-bold mb-4">Schedule Calibration (Coming Soon)</h3>
      <button
        onClick={() => setIsCalibrationModalOpen(false)}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
      >
        Close
      </button>
    </div>
  </div>
)}
      case 'pms':
        return <PmsPage pmTickets={pmTickets} />;
      case 'tickets':
        return <TicketsPage
        tickets={tickets}
        pmTickets={pmTickets}
        calibrationTickets={calibrationTickets}
        onClosePmTicket={handleClosePmTicket}
        onCloseCalibrationTicket={handleCloseCalibrationTicket}
        onEditBreakdownTicket={handleEditBreakdownTicket}
      />;
      case 'machines':
        return <MachinesPage machines={machines} setMachines={setMachines} />;
      case 'instruments':
        return <InstrumentsPage instruments={instruments} setInstruments={setInstruments} />;
      case 'users':
        return <UsersPage users={users} setUsers={setUsers} />;
      case 'settings':
        return <SettingsPage />;
      case 'login':
      default:
        return <LoginPage onLogin={handleLogin} users={users} onGoToAnonymousForm={() => setCurrentPage('anonymous-form')} />;
    }
  };

  if (!isLoggedIn && currentPage !== 'anonymous-form') {
    return <LoginPage onLogin={handleLogin} users={users} onGoToAnonymousForm={() => setCurrentPage('anonymous-form')} />;
  }
if (currentPage === 'anonymous-form') {
      
    return (
    <BreakdownTicketFormAnonymous
      machines={machines}
      onCreateTicket={handleAddTicket}
      onGoBack={() => setCurrentPage('login')}
    />
  );

    }

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center font-sans">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">PM Scheduler</h1>

      {/* Navigation Menu (Conditionally Rendered) */}
      <nav className="mb-8 p-2 bg-white rounded-full shadow-md flex space-x-2">
        <button
          onClick={() => setCurrentPage('tickets')}
          className={`p-3 rounded-full transition-all duration-200 flex items-center space-x-2 font-medium ${currentPage === 'tickets' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <Ticket className="w-5 h-5" />
          <span>Tickets</span>
        </button>

        {/* Only show these buttons for Admin users */}
        {currentUserRole === 'Admin' && (
          <>
            <button
              onClick={() => setCurrentPage('calendar')}
              className={`p-3 rounded-full transition-all duration-200 flex items-center space-x-2 font-medium ${currentPage === 'calendar' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Calendar className="w-5 h-5" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setCurrentPage('pms')}
              className={`p-3 rounded-full transition-all duration-200 flex items-center space-x-2 font-medium ${currentPage === 'pms' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
              <span>PM Schedules</span>
            </button>
            <button
              onClick={() => setCurrentPage('machines')}
              className={`p-3 rounded-full transition-all duration-200 flex items-center space-x-2 font-medium ${currentPage === 'machines' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Package className="w-5 h-5" />
              <span>Machines</span>
            </button>
             {/* --- NEW NAVIGATION BUTTON FOR INSTRUMENT MASTER --- */}
            <button
              onClick={() => setCurrentPage('instruments')}
              className={`p-3 rounded-full transition-all duration-200 flex items-center space-x-2 font-medium ${currentPage === 'instruments' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Layers className="w-5 h-5" />
              <span>Instruments</span>
            </button>
            <button
              onClick={() => setCurrentPage('users')}
              className={`p-3 rounded-full transition-all duration-200 flex items-center space-x-2 font-medium ${currentPage === 'users' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Users className="w-5 h-5" />
              <span>Users</span>
            </button>
            <button
              onClick={() => setCurrentPage('settings')}
              className={`p-3 rounded-full transition-all duration-200 flex items-center space-x-2 font-medium ${currentPage === 'settings' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </>
        )}

        <button
          onClick={handleLogout}
          className="p-3 rounded-full transition-all duration-200 flex items-center space-x-2 font-medium text-red-500 hover:bg-gray-100"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </nav>

      {renderPage()}

      {/* Modals */}
      {currentUserRole === 'Admin' && (
        <>
          <PMScheduleModal
            isOpen={isPmModalOpen}
            onClose={() => setIsPmModalOpen(false)}
            onSavePmTickets={handleSavePmTickets}
            machines={machines}
          />
          <DaySummaryModal
            isOpen={isDaySummaryModal}
            onClose={() => setIsDaySummaryModal(false)}
            selectedDate={selectedDate}
            ticketsForDate={selectedDateTickets}
          />
              {/* Add the next line here ??? */}
    <CalibrationScheduleModal
      isOpen={isCalibrationModalOpen}
      onClose={() => setIsCalibrationModalOpen(false)}
      onSaveCalibrationTickets={handleSaveCalibrationTickets}
      instruments={instruments}
    />
        </>
      )}
    </div>
  );
}
