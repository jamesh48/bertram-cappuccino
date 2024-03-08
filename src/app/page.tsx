import styles from './page.module.css';
import { use } from 'react';
import Wrapper from '@/components/Wrapper';

export default function Page() {
  return (
    <main className={styles.main}>
      <Wrapper />
    </main>
  );
}
