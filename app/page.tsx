'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Redirect to betterwork.vn
    window.location.href = 'https://betterwork.vn';
  }, []);

  return (<></>);
}
