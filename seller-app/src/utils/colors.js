export const colors = {
  primary: '#4F46E5',
  primaryHover: '#4338CA',
  primaryActive: '#3730A3',
  darkText: '#111827',
  bodyText: '#4B5563',
  labelText: '#6B7280',
  mutedBorder: '#D1D5DB',
  cardBg: '#FFFFFF',
  pageBg: '#F5F6FA',
  lightBg: '#F9FAFB',
  inStockBg: '#DCFCE7',
  inStockText: '#15803D',
  lowStockBg: '#FEF3C7',
  lowStockText: '#B45309',
  soldOutBg: '#FEE2E2',
  soldOutText: '#B91C1C',
  lightGrey: '#E5E7EB',
  lighterGrey: '#F3F4F6',
  logoBg: '#EEF2FF'
}

export const getStatusChipColors = (status) => {
  switch (status) {
    case 'In Stock':
      return { bg: colors.inStockBg, text: colors.inStockText }
    case 'Low Stock':
      return { bg: colors.lowStockBg, text: colors.lowStockText }
    case 'Sold Out':
      return { bg: colors.soldOutBg, text: colors.soldOutText }
    default:
      return { bg: colors.lightBg, text: colors.bodyText }
  }
}
