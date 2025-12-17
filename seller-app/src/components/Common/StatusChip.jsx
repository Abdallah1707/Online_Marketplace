import { getStatusChipColors } from '../../utils/colors'
import './StatusChip.css'

export default function StatusChip({ status }) {
  const colors = getStatusChipColors(status)

  return (
    <div 
      className="status-chip"
      style={{
        backgroundColor: colors.bg,
        color: colors.text
      }}
    >
      {status}
    </div>
  )
}
