import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero} aria-labelledby='home-title'>
        <div className={styles.cardStage} aria-hidden='true'>
          <div className={styles.libraryCard}>
            <div className={styles.cardHeader}>BOOKMAN LIBRARY</div>
            <div className={styles.cardTitle}>Library Card</div>
            <div className={styles.cardRows}>
              <span />
              <span />
              <span />
            </div>
            <div className={styles.cardStamp}>貸出</div>
          </div>
        </div>

        <div className={styles.content}>
          <p className={styles.kicker}>Bookman</p>
          <h1 id='home-title'>図書館の運用を、静かに整理する。</h1>
          <p className={styles.lead}>
            蔵書、館、貸出の導線をひとつにまとめた図書館管理システムです。
          </p>

          <div className={styles.actions} aria-label='主要機能'>
            <Link className={styles.primaryAction} href='/branch'>
              図書館を管理
            </Link>
            <Link className={styles.secondaryAction} href='/book'>
              本をかりる
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
