export const sanitizeForFirestore = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (obj[key] !== undefined) {
        result[key] = sanitizeForFirestore(obj[key]);
      }
    }
  }
  return result;
};
