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
  
  // Try ID matching first
  if (targetId) {
    const matchedById = tripMembers.find((member) => {
      const memberIds = [member?._id, member?.id, member?.user, member?.userId]
        .map(resolveMemberId)
        .filter(Boolean);
      return memberIds.includes(targetId);
    });
    if (matchedById) return matchedById;
  }

  // Fallback to name matching if it's an object with a name
  if (value && typeof value === 'object' && value.name && value.name !== 'Unknown') {
    const matchedByName = tripMembers.find(m => m.name === value.name);
    if (matchedByName) return matchedByName;
  }

  return null;
};

export const getTripMemberName = (tripMembers = [], value, expenses = []) => {
  if (value && typeof value === 'object' && value.name && value.name !== 'Unknown') {
    return value.name;
  }

  const member = findTripMemberById(tripMembers, value);
  if (member && member.name !== 'Unknown') return member.name;
  
  // Extreme fallback for old buggy records: search expenses for the ID
  const targetId = resolveMemberId(value);
  if (targetId && expenses && expenses.length > 0) {
    for (const exp of expenses) {
      if (exp.paidBy && resolveMemberId(exp.paidBy) === targetId && exp.paidBy.name && exp.paidBy.name !== 'Unknown') {
        return exp.paidBy.name;
      }
      for (const split of (exp.splitAmong || [])) {
        if (resolveMemberId(split) === targetId && split.name && split.name !== 'Unknown') {
          return split.name;
        }
      }
    }
  }

  return 'Unknown';
};

export const buildTripMemberBalanceLookup = (tripMembers = []) => {
  const lookup = new Map();

  tripMembers.forEach((member) => {
    const balance = { id: resolveMemberId(member) || member.name, name: member.name, net: 0, paid: 0, owes: 0 };
    
    // Alias by all known IDs
    [member._id, member.id, member.user, member.userId]
      .map(resolveMemberId)
      .filter(Boolean)
      .forEach((memberId) => lookup.set(memberId, balance));
      
    // Alias by name as a fallback for dummy members with changing IDs
    if (member.name && member.name !== 'Unknown') {
      lookup.set(member.name.toLowerCase(), balance);
    }
  });

  return lookup;
};