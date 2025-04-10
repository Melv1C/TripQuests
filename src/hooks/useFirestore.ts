import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  DocumentData, 
  QueryConstraint, 
  addDoc, 
  collection, 
  deleteDoc, 
  doc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getDocumentById, getDocuments } from '../utils/firebase-helpers';

/**
 * Hook for fetching a document by ID using TanStack Query
 * @param collectionPath Firestore collection path
 * @param docId Document ID to fetch (if undefined, query will be disabled)
 * @param options Additional TanStack Query options
 * @returns Query result with document data
 */
export function useDocument<T = DocumentData>(
  collectionPath: string,
  docId: string | undefined,
  options: { 
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
  } = {}
) {
  return useQuery({
    queryKey: ['document', collectionPath, docId],
    queryFn: () => getDocumentById<T>(collectionPath, docId as string),
    enabled: !!docId && (options.enabled !== false),
    staleTime: options.staleTime || 5 * 60 * 1000, // 5 minutes by default
    gcTime: options.cacheTime || 10 * 60 * 1000,  // 10 minutes by default
  });
}

/**
 * Hook for fetching documents from a collection using TanStack Query
 * @param collectionPath Firestore collection path
 * @param constraints Optional query constraints
 * @param options Additional TanStack Query options
 * @returns Query result with array of documents
 */
export function useCollection<T = DocumentData>(
  collectionPath: string,
  constraints: QueryConstraint[] = [],
  options: { 
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
  } = {}
) {
  const constraintsKey = JSON.stringify(
    constraints.map(c => JSON.stringify(c))
  );

  return useQuery({
    queryKey: ['collection', collectionPath, constraintsKey],
    queryFn: () => getDocuments<T>(collectionPath, constraints),
    enabled: options.enabled !== false,
    staleTime: options.staleTime || 5 * 60 * 1000, // 5 minutes by default
    gcTime: options.cacheTime || 10 * 60 * 1000,  // 10 minutes by default
  });
}

/**
 * Hook for creating a new document in a collection
 * @param collectionPath Firestore collection path
 * @returns Mutation function and state
 */
export function useAddDocument<T extends object>(collectionPath: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: T) => {
      const collectionRef = collection(db, collectionPath);
      const docRef = await addDoc(collectionRef, data);
      return { id: docRef.id, ...data };
    },
    onSuccess: () => {
      // Invalidate collection queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['collection', collectionPath] });
    },
  });
}

/**
 * Hook for updating a document
 * @param collectionPath Firestore collection path
 * @returns Mutation function and state
 */
export function useUpdateDocument<T extends object>(collectionPath: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      const docRef = doc(db, collectionPath, id);
      await updateDoc(docRef, data as DocumentData);
      return { id, ...data };
    },
    onSuccess: (result) => {
      // Invalidate specific document and collection queries
      queryClient.invalidateQueries({ 
        queryKey: ['document', collectionPath, result.id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['collection', collectionPath] 
      });
    },
  });
}

/**
 * Hook for deleting a document
 * @param collectionPath Firestore collection path
 * @returns Mutation function and state
 */
export function useDeleteDocument(collectionPath: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const docRef = doc(db, collectionPath, id);
      await deleteDoc(docRef);
      return id;
    },
    onSuccess: (id) => {
      // Invalidate specific document and collection queries
      queryClient.invalidateQueries({ 
        queryKey: ['document', collectionPath, id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['collection', collectionPath] 
      });
    },
  });
}

/**
 * Hook for setting a document with a specific ID
 * @param collectionPath Firestore collection path
 * @returns Mutation function and state
 */
export function useSetDocument<T extends object>(collectionPath: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: T }) => {
      const docRef = doc(db, collectionPath, id);
      await setDoc(docRef, data as DocumentData);
      return { id, ...data };
    },
    onSuccess: (result) => {
      // Invalidate specific document and collection queries
      queryClient.invalidateQueries({ 
        queryKey: ['document', collectionPath, result.id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['collection', collectionPath] 
      });
    },
  });
} 