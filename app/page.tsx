'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

interface DocFile {
  id: string;
  fileName: string;
  contentType: string;
  createdAt: string;
}

async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>, token: string) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }
  const formData = new FormData();
  formData.append('file', file);

  try {
    await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
  } finally {
    URL.revokeObjectURL(file.name);
    event.target.value = '';
  }
}

export default function Home() {
  const [media, setMedia] = useState([]);
  const [total, setTotal] = useState(0);
  const [token, setToken] = useState('');

  useEffect(() => {
    async function fetchMedia() {
      try {
        const response = await fetch('/api/media?page=1&limit=10');
        const data = await response.json();
        setTotal(data.total);
        setMedia(data.results || []);
      } catch (error) {
        console.error('Error fetching media:', error);
      }
    }

    fetchMedia();
  }, [total]);

  async function uploadData(event: React.ChangeEvent<HTMLInputElement>) {
    await handleFileChange(event, token);

    setTotal((prevTotal) => prevTotal + 1);
  }

  return (
<div className={styles.page}>
    <main className={styles.main}>
      <div>
        <textarea className='w-full h-30'
          value={token} onChange={(e) => setToken(e.target.value)} />
      </div>
      <div>
          <input type="file" onInput={uploadData} />
      </div>
    </main>
    <div className="flex flex-col gap-4 p-4">
      {media.map((item: DocFile) => (
        <div key={item.id} className="p-4 border rounded shadow">
          <p>{item.fileName}</p>
          <p>{new Date(item.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
</div>
  );
}
