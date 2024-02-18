import Image from "next/image";
import styles from "./page.module.css";

import InitFirebaseApp from '@/InitFirebaseApp';

export default function Home() {
  return (
    <main className={styles.main}>
      <InitFirebaseApp />

      <div className={styles.description}>
        <p>
          Get started by editing&nbsp;
          <code className={styles.code}>src/app/page.js</code>
        </p>
      </div>
    </main>
  );
}
