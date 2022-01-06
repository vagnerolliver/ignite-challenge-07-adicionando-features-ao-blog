import { FiUser, FiCalendar } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';

import { getPrismicClient } from '../services/prismic';
import { formatDatePtBR } from '../helpers/datePtBR';
import Header from '../components/Header';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  function loadMorePosts(): void {
    fetch(nextPage)
      .then(response => response.json())
      .then((data: PostPagination) => {
        setPosts([...posts, ...data.results]);
        setNextPage(data.next_page);
      });
  }

  return (
    <>
      <Header />
      <div className={commonStyles.container}>
        <div className={styles.HomeContent}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <span>
                  <FiUser />
                  <time>
                    {formatDatePtBR(new Date(post.first_publication_date))}
                  </time>
                  <FiCalendar /> {post.data.author}
                </span>
              </a>
            </Link>
          ))}
        </div>

        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}

        {nextPage && (
          <div className={styles.HomeFooter}>
            <button type="button" onClick={loadMorePosts}>
              Carregar mais posts
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      orderings: '[document.first_publication_date desc]',
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
      ref: previewData?.ref ?? null,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
      preview,
    },
    revalidate: 60 * 60 * 24,
  };
};
