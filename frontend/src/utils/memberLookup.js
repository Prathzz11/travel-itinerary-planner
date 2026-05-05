export const resolveMemberId = (value) => {
  if (!value) return null;

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (typeof value !== 'object') {
    return null;
  }

  const candidate = value.userId || value.memberId || value._id || value.id || value.user;

  if (!candidate) {
    return null;
  }

  if (typeof candidate === 'object') {
    return String(candidate._id || candidate.id || candidate.userId || candidate.memberId || candidate);
  }

  return String(candidate);
};

export const findTripMemberById = (tripMembers = [], value) => {
  const targetId = resolveMemberId(value);
  if (!targetId) return null;

  return tripMembers.find((member) => {
    const memberIds = [member?._id, member?.id, member?.user, member?.userId]
      .map(resolveMemberId)
      .filter(Boolean);

    return memberIds.includes(targetId);
  }) || null;
};

export const getTripMemberName = (tripMembers = [], value) => {
  if (value && typeof value === 'object' && value.name && value.name !== 'Unknown') {
    return value.name;
  }

  return findTripMemberById(tripMembers, value)?.name || 'Unknown';
};

export const buildTripMemberBalanceLookup = (tripMembers = []) => {
  const lookup = new Map();

  tripMembers.forEach((member) => {
    const balance = { id: resolveMemberId(member), name: member.name, net: 0, paid: 0, owes: 0 };
    [member._id, member.id, member.user, member.userId]
      .map(resolveMemberId)
      .filter(Boolean)
      .forEach((memberId) => lookup.set(memberId, balance));
  });

  return lookup;
};