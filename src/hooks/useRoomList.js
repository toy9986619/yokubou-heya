'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

import { getFirebaseDb } from '@/firebase';
import { useAuth } from '@/contexts/AuthContext';

export const useRoomList = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRooms([]);
      setLoading(false);
      return undefined;
    }
    const db = getFirebaseDb();
    const q = query(
      collection(db, 'rooms'),
      where('memberUids', 'array-contains', user.uid),
      orderBy('createdAt', 'desc'),
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setRooms(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  return { rooms, loading };
};
