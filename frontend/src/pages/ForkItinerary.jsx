import { Navigate, useParams } from 'react-router-dom';

// Reuse the working copy wizard on the template detail page.
export default function ForkItinerary() {
  const { id } = useParams();
  return <Navigate to={`/itinerary/${id}`} replace />;
}
