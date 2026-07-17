import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero} aria-labelledby='home-title'>
        <div className={styles.cardStage} aria-hidden='true'>
          <div className={styles.libraryCard}>
            <div className={styles.cardTopLine} />
            <div className={styles.cardNumber}>No.</div>
            <div className={styles.cardNameLine} />
            <div className={styles.cardGrid}>
              <span>貸出日</span>
              <span>返却日</span>
              <span>氏名</span>
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <p className={styles.kicker}>Bookman</p>
          <h1 id='home-title'>図書館業務を、すっきり管理。</h1>
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
