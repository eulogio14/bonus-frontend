export const FormatUsername = (email: string | undefined | null) => {
  // 1. Si el correo no existe o es undefined, devolvemos un valor por defecto SIN que React explote
  if (!email) return 'Viajer@';
  
  // 2. Solo si estamos seguros de que es un texto, hacemos los recortes
  const beforeAt = email.split('@')[0];
  const namePart = beforeAt.includes('.') ? beforeAt.split('.')[0] : beforeAt;
  
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
};