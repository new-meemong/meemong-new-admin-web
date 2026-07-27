"use client";

import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { resolveFirestoreDatabaseId } from "@/lib/firebase/database";

// Firebase Web App 설정은 공개 식별자이며 meemong-chat-admin과 동일하다.
const firebaseConfig = {
  apiKey: "AIzaSyAszQxVWw1sap2X6EWsjErAuVpC1t1Rvic",
  authDomain: "new-meemong.firebaseapp.com",
  projectId: "new-meemong",
  storageBucket: "new-meemong.firebasestorage.app",
  messagingSenderId: "425261596153",
  appId: "1:425261596153:web:2b2cab0df9ee1b2e979128",
  measurementId: "G-RHKCZXCFQ5",
};

const app = getApps()[0] ?? initializeApp(firebaseConfig);
const firestoreDatabaseId = resolveFirestoreDatabaseId();
const db = getFirestore(app, firestoreDatabaseId);

export { app, db, firestoreDatabaseId };
