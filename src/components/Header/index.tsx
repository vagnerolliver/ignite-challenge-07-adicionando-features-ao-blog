import Image from 'next/image';
import Link from 'next/link';

import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={`${commonStyles.container} ${styles.header}`}>
      <Link href="/">
        <a>
          <Image src="/images/Logo.svg" alt="logo" width="239" height="27" />
        </a>
      </Link>
    </header>
  );
}
