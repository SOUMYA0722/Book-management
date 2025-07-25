'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import BookCard from '@/components/BookCard';
import { toast } from 'sonner';

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);

  // Initial book fetch
  useEffect(() => {
    const fetchBooks = async () => {
      const { data, error } = await supabase.from('books').select('*');
      if (error) {
        console.error('Error fetching books:', error);
      } else {
        setBooks(data || []);
      }
    };

    fetchBooks();
  }, []);

  // ✅ Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('realtime:books')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT | UPDATE | DELETE
          schema: 'public',
          table: 'books',
        },
        (payload) => {
          console.log('Realtime update:', payload);

          // Show toast notification (optional)
          if (payload.eventType === 'INSERT') {
            toast.success(`New book added: ${payload.new.title}`);
          } else if (payload.eventType === 'UPDATE') {
            toast.info(`Book updated: ${payload.new.title}`);
          } else if (payload.eventType === 'DELETE') {
            toast.warning(`Book deleted: ${payload.old.title}`);
          }

          // Re-fetch updated books list
          (async () => {
            const { data, error } = await supabase.from('books').select('*');
            if (!error) setBooks(data || []);
          })();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Clean up on unmount
    };
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-4 p-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
