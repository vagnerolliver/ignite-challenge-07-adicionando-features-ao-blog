import { useEffect, useRef } from 'react';

import styles from './styles.module.scss';

export default function Comments(): JSX.Element {
  const commentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const comment = commentRef.current;

    const script = document.createElement('script');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute(
      'repo',
      'vagnerolliver/ignite-challenge-07-adicionando-features-ao-blog'
    );
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-dark');
    script.async = true;
    comment.appendChild(script);
  }, []);

  return <div className={styles.comments} ref={commentRef} />;
}
