export function hexToRgb(hexColor) {
  const R = parseInt(hexColor.substr(1, 2), 16);
  const G = parseInt(hexColor.substr(3, 2), 16);
  const B = parseInt(hexColor.substr(5, 2), 16);
  return {R, G, B};
}
