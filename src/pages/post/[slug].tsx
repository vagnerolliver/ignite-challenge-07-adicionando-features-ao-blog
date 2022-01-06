import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';

// import { render } from '@testing-library/react';

import { getPrismicClient } from '../../services/prismic';
import { formatDatePtBR } from '../../helpers/datePtBR';
import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface PostContent {
  heading: string;
  body: {
    text: string;
  }[];
}
interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: PostContent[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
}

export default function Post({ post, preview }: PostProps): JSX.Element {
  const { first_publication_date } = post;
  const { title, author, banner, content } = post.data;

  const router = useRouter();

  function averageReadingTime(): number {
    const totalWords = content.reduce((accWords, postContent) => {
      let postHeading = 0;
      let postBody = 0;

      if (postContent.heading) {
        postHeading = postContent.heading.trim().split(/\s+/).length;
      }

      if (RichText.asText(postContent.body)) {
        postBody = RichText.asText(postContent.body).trim().split(/\s+/).length;
      }

      return accWords + postHeading + postBody;
    }, 0);

    const wordsPerMinute = 200;

    return Math.ceil(totalWords / wordsPerMinute);
  }

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>{title} | spacetraveling.</title>
      </Head>

      <main className={styles.postContainer}>
        <Header />

        <div className={styles.postImage}>
          <Image src={banner.url.split('?')[0]} layout="fill" />
        </div>

        <section className={`${commonStyles.container} ${styles.post}`}>
          <h1>{title}</h1>

          <span className={styles.postInfo}>
            <p>
              <FiUser />
              <time>{formatDatePtBR(new Date(first_publication_date))}</time>
            </p>
            <p>
              <FiCalendar /> {author}
            </p>
            <p>
              <FiClock /> {averageReadingTime()} min
            </p>
          </span>

          {content.map(postContent => {
            return (
              <div className={styles.postContent} key={postContent.heading}>
                <h2>{postContent.heading}</h2>
                <article
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(postContent.body),
                  }}
                />
              </div>
            );
          })}

          {preview && (
            <aside>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 100,
    }
  );

  const paths = posts.results.map(post => {
    return {
      params: { slug: post.uid },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();

  const response = (await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  })) as Post;

  const { first_publication_date, data } = response;
  return {
    props: {
      post: {
        data,
        first_publication_date,
      },
      preview,
    },
  };
};
