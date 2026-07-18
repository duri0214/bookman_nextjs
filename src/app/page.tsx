import Link from 'next/link'
import LibraryCard from '@/components/LibraryCard'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero} aria-labelledby='home-title'>
        <div className={styles.cardStage} aria-hidden='true'>
          <LibraryCard animated />
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
            <button className={styles.secondaryAction} type='button' disabled>
              本をかりる
              <span>未実装</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
