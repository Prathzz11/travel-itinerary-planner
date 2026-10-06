import { useAuth } from './useAuth';
export function useTripPermissions(trip) {
  const { user } = useAuth();
  const id = user?.id || user?._id;
  const ownerId = trip?.owner?._id || trip?.owner;
  const isOwner = Boolean(id && String(ownerId) === String(id));
  const member = trip?.members?.find(item => String(item.user?._id || item.user) === String(id));
  const canManage = isOwner || member?.role === 'admin';
  return { isOwner, canManage, canEdit: canManage || member?.role === 'editor' };
}
