// Minimal public fixtures for validating context. No technical specifications.
// These identifiers demonstrate rules; they are not a copy of the company catalog.
export const familyProductSlugs = [
  'ethylene-bis-stearamide', 'pentaerythritol-stearate', 'zinc-stearate'
];
export const additionalApplications = [
  'hot-melt-adhesives', 'powder-coatings', 'road-marking',
  'modified-asphalt', 'wood-plastic-composites', 'modified-plastics'
].map(slug => ({slug}));
const documents = [
  {id:'masterbatch-pe-wax', product:'masterbatch-dispersion-wax'},
  {id:'low-viscosity-pe-wax', product:'pvc-lubrication-wax'}
];
export function findTds(id:string) { return documents.find(document => document.id === id); }
