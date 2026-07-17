import styles from './LibraryCard.module.css'

type LibraryCardProps = {
  columns?: [string, string, string]
  rows?: number
  animated?: boolean
}

export default function LibraryCard({
  columns = ['貸出日', '返却日', '氏名'],
  rows = 3,
  animated = false,
}: LibraryCardProps) {
  const cells = Array.from({ length: columns.length * rows })

  return (
    <div className={`${styles.card} ${animated ? styles.animated : ''}`}>
      <div className={styles.topLine} />
      <div className={styles.number}>No.</div>
      <div className={styles.nameLine} />
      <div className={styles.grid}>
        {columns.map((column) => (
          <span key={column}>{column}</span>
        ))}
        {cells.map((_, index) => (
          <span key={`cell-${index}`} />
        ))}
      </div>
    </div>
  )
}
