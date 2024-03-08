import styles from './page.module.css';
import Home from '../components/home';
import { use } from 'react';

const getCoffeeDrinkers = async () => {
  const r = await fetch('http://localhost:3000/api/fetchCoffeeDrinkers', {
    cache: 'no-store',
  });
  return r.json();
};

export default function Page() {
  const data = use(getCoffeeDrinkers());
  return (
    <main className={styles.main}>
      <Home data={data} />
    </main>
  );
}
