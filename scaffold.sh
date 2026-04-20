#!/bin/bash

# Create directories
mkdir -p src/utils src/services src/hooks src/contexts src/components/common src/components/trip src/components/activity src/components/budget src/components/itinerary src/components/accommodation src/pages

# Create Utils
touch src/utils/constants.js
touch src/utils/helpers.js
touch src/utils/validators.js
touch src/utils/formatters.js

# Create Services
touch src/services/api.js
touch src/services/socketService.js
touch src/services/authService.js
touch src/services/tripService.js
touch src/services/activityService.js
touch src/services/expenseService.js
touch src/services/itineraryService.js
touch src/services/templateService.js

# Create Hooks
touch src/hooks/useAuth.js
touch src/hooks/useTrip.js
touch src/hooks/useSocket.js
touch src/hooks/useForm.js
touch src/hooks/useDebounce.js
touch src/hooks/useLocalStorage.js

# Create Contexts
touch src/contexts/AuthContext.jsx
touch src/contexts/TripContext.jsx
touch src/contexts/ItineraryContext.jsx
touch src/contexts/SocketContext.jsx

# Create Pages (already have Home, will overwrite App.jsx later to import them)
touch src/pages/Login.jsx
touch src/pages/Signup.jsx
touch src/pages/Dashboard.jsx
touch src/pages/CreateTrip.jsx
touch src/pages/TripDetail.jsx
touch src/pages/Itinerary.jsx
touch src/pages/BudgetPage.jsx
touch src/pages/BrowseItineraries.jsx
touch src/pages/ExistingItineraryDetail.jsx
touch src/pages/ForkItinerary.jsx
touch src/pages/MyTemplates.jsx

echo "Scaffolding complete"
