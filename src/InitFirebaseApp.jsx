'use client';

import { useEffect } from 'react';

import { initFirebase } from './firebase';

const InitFirebaseApp = () => {
  useEffect(() => {
    initFirebase();
  })
};

export default InitFirebaseApp;
