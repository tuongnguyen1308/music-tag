import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.scss";
import MusicPlayer from "./components/MusicPlayer";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Music Tag | by 1minh1goc</title>
        <meta name="description" content="App tạo ảnh giao diện nhạc" />
        <meta name="author" content="1minh1goc" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <MusicPlayer />
      </main>
    </div>
  );
};

export default Home;
