import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  QueryConstraint,
  DocumentData,
  WhereFilterOp
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Helper function to fetch a document by ID
 * @param collectionPath The Firestore collection path
 * @param docId The document ID to fetch
 * @returns The document data with ID included or null if not found
 */
export async function getDocumentById<T = DocumentData>(
  collectionPath: string, 
  docId: string
): Promise<T & { id: string } | null> {
  try {
    const docRef = doc(db, collectionPath, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T & { id: string };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching document ${docId} from ${collectionPath}:`, error);
    throw error;
  }
}

/**
 * Helper function to fetch documents from a collection with optional filtering
 * @param collectionPath The Firestore collection path
 * @param constraints Optional query constraints 
 * @returns Array of documents with IDs included
 */
export async function getDocuments<T = DocumentData>(
  collectionPath: string,
  constraints: QueryConstraint[] = []
): Promise<(T & { id: string })[]> {
  try {
    const collectionRef = collection(db, collectionPath);
    const q = constraints.length > 0 
      ? query(collectionRef, ...constraints) 
      : query(collectionRef);
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T & { id: string }));
  } catch (error) {
    console.error(`Error fetching documents from ${collectionPath}:`, error);
    throw error;
  }
}

/**
 * Helper function to create a where constraint
 * @param field The document field to filter on
 * @param operator The comparison operator
 * @param value The value to compare against
 * @returns A where query constraint
 */
export function createWhereConstraint(
  field: string, 
  operator: WhereFilterOp, 
  value: unknown
): QueryConstraint {
  return where(field, operator, value);
} 