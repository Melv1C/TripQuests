/**
 * Generates a random alphanumeric invite code
 * 
 * @param length The length of the invite code (default: 6)
 * @returns Random alphanumeric invite code
 */
export const generateInviteCode = (length = 6): string => {
  // Characters to use for the invite code (alphanumeric, uppercase for readability)
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters like 0, O, 1, I
  let result = '';
  
  // Generate a random string of specified length
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  
  return result;
}; 