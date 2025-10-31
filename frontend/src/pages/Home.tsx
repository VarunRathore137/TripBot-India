import React from 'react';
import Hero from '@/components/custom/Hero';

interface HomeProps {
  heroRef?: React.RefObject<HTMLDivElement>;
}

function Home({ heroRef }: HomeProps) {
  return (
    <div>
      <Hero heroRef={heroRef} />
    </div>
  );
}

export default Home;