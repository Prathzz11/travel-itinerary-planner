import os

files = {
    # Utils
    "src/utils/helpers.js": "export const formatDate = (date) => new Date(date).toLocaleDateString();\nexport const formatCurrency = (amount, curr='USD') => new Intl.NumberFormat('en-US', {style:'currency', currency:curr}).format(amount);\nexport const calculateDuration = (start, end) => 1;\nexport const getInitials = (name) => name.substring(0, 2).toUpperCase();\nexport const slugify = (text) => text.toLowerCase().replace(/\\s+/g, '-');",
    "src/utils/validators.js": "export const validateEmail = (email) => /^\\S+@\\S+\\.\\S+$/.test(email);\nexport const validatePassword = (pwd) => pwd.length >= 8;\nexport const validateForm = () => true;",
    "src/utils/formatters.js": "export const formatActivityTime = (time) => time;\nexport const formatTripDates = (start, end) => `${start} - ${end}`;\nexport const formatBudget = (amount) => `$${amount}`;",

    # Services
    "src/services/api.js": "import axios from 'axios';\nimport { API_BASE_URL } from '../utils/constants';\nconst api = axios.create({ baseURL: API_BASE_URL });\nexport default api;",
    "src/services/socketService.js": "import { io } from 'socket.io-client';\nimport { SOCKET_URL } from '../utils/constants';\nexport const socket = io(SOCKET_URL, { autoConnect: false });",
    "src/services/authService.js": "import api from './api';\nexport const login = (data) => api.post('/auth/login', data);\nexport const signup = (data) => api.post('/auth/signup', data);\nexport const getMe = () => api.get('/auth/me');",
    "src/services/tripService.js": "import api from './api';\nexport const fetchTrips = () => api.get('/trips');\nexport const createTrip = (data) => api.post('/trips', data);",
    "src/services/activityService.js": "import api from './api';\nexport const getActivities = (tripId) => api.get(`/trips/${tripId}/activities`);",
    "src/services/expenseService.js": "import api from './api';\nexport const getExpenses = (tripId) => api.get(`/trips/${tripId}/expenses`);",
    "src/services/itineraryService.js": "import api from './api';\nexport const getPublicItineraries = () => api.get('/itineraries');",
    "src/services/templateService.js": "import api from './api';\nexport const getTemplates = () => api.get('/templates');",

    # Hooks
    "src/hooks/useAuth.js": "import { useAuth as useAuthCtx } from '../contexts/AuthContext';\nexport const useAuth = () => useAuthCtx();",
    "src/hooks/useTrip.js": "import { useContext } from 'react';\nimport { TripContext } from '../contexts/TripContext';\nexport const useTrip = () => useContext(TripContext);",
    "src/hooks/useSocket.js": "import { useContext } from 'react';\nimport { SocketContext } from '../contexts/SocketContext';\nexport const useSocket = () => useContext(SocketContext);",
    "src/hooks/useForm.js": "import { useState } from 'react';\nexport const useForm = (initial, onSubmit) => {\n  const [values, setValues] = useState(initial);\n  const handleChange = (e) => setValues({...values, [e.target.name]: e.target.value});\n  const handleSubmit = (e) => { e.preventDefault(); onSubmit(values); };\n  return { values, handleChange, handleSubmit };\n};",
    "src/hooks/useDebounce.js": "import { useState, useEffect } from 'react';\nexport function useDebounce(value, delay) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const handler = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(handler);\n  }, [value, delay]);\n  return debounced;\n}",

    # Contexts
    "src/contexts/TripContext.jsx": "import React, { createContext } from 'react';\nexport const TripContext = createContext();\nexport const TripProvider = ({ children }) => <TripContext.Provider value={{}}>{children}</TripContext.Provider>;",
    "src/contexts/ItineraryContext.jsx": "import React, { createContext } from 'react';\nexport const ItineraryContext = createContext();\nexport const ItineraryProvider = ({ children }) => <ItineraryContext.Provider value={{}}>{children}</ItineraryContext.Provider>;",
    "src/contexts/SocketContext.jsx": "import React, { createContext } from 'react';\nexport const SocketContext = createContext();\nexport const SocketProvider = ({ children }) => <SocketContext.Provider value={{}}>{children}</SocketContext.Provider>;",

    # Pages
    "src/pages/Login.jsx": "import React from 'react';\nconst Login = () => <div className='page-container glass-panel'><h1>Login</h1></div>;\nexport default Login;",
    "src/pages/Signup.jsx": "import React from 'react';\nconst Signup = () => <div className='page-container glass-panel'><h1>Signup</h1></div>;\nexport default Signup;",
    "src/pages/Dashboard.jsx": "import React from 'react';\nconst Dashboard = () => <div className='page-container glass-panel'><h1>Dashboard</h1></div>;\nexport default Dashboard;",
    "src/pages/CreateTrip.jsx": "import React from 'react';\nconst CreateTrip = () => <div className='page-container glass-panel'><h1>Create Trip Wizard</h1></div>;\nexport default CreateTrip;",
    "src/pages/TripDetail.jsx": "import React from 'react';\nconst TripDetail = () => <div className='page-container glass-panel'><h1>Trip Detail</h1></div>;\nexport default TripDetail;",
    "src/pages/Itinerary.jsx": "import React from 'react';\nconst Itinerary = () => <div className='page-container glass-panel'><h1>Itinerary</h1></div>;\nexport default Itinerary;",
    "src/pages/BudgetPage.jsx": "import React from 'react';\nconst BudgetPage = () => <div className='page-container glass-panel'><h1>Budget</h1></div>;\nexport default BudgetPage;",
    "src/pages/BrowseItineraries.jsx": "import React from 'react';\nconst BrowseItineraries = () => <div className='page-container glass-panel'><h1>Explore Itineraries</h1></div>;\nexport default BrowseItineraries;",
    "src/pages/ExistingItineraryDetail.jsx": "import React from 'react';\nconst ExistingItineraryDetail = () => <div className='page-container glass-panel'><h1>Public Itinerary</h1></div>;\nexport default ExistingItineraryDetail;",
    "src/pages/ForkItinerary.jsx": "import React from 'react';\nconst ForkItinerary = () => <div className='page-container glass-panel'><h1>Fork Itinerary</h1></div>;\nexport default ForkItinerary;",
    "src/pages/MyTemplates.jsx": "import React from 'react';\nconst MyTemplates = () => <div className='page-container glass-panel'><h1>My Templates</h1></div>;\nexport default MyTemplates;"
}

for path, content in files.items():
    with open(path, 'w') as f:
        f.write(content)
