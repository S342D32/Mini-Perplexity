// lib/utils/generateUserId.ts
function generateRandomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function generateUniqueUserId(sql: any): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const candidateId = generateRandomId();
    
    try {
      const existing = await sql`
        SELECT nextauth_user_id FROM user_profiles 
        WHERE nextauth_user_id = ${candidateId}
      `;
      
      if (existing.length === 0) {
        return candidateId;
      }
      
      attempts++;
    } catch (error) {
      console.error('Error checking unique ID:', error);
      attempts++;
    }
  }
  
  // Fallback
  const timestamp = Date.now().toString().slice(-4);
  const randomChars = generateRandomId().slice(0, 2);
  return timestamp + randomChars;
}
