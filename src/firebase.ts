import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
   getDocFromServer,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import blueprint from '../firebase-blueprint.json';
import { UserProfile } from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Extract validation constants directly from firebase-blueprint.json
const userProps = blueprint.entities.UserProfile.properties;
export const USER_VALIDATION_RULES = {
  uidMaxLength: userProps.uid.maxLength ?? 128,
  uidPattern: new RegExp(userProps.uid.pattern ?? '^[a-zA-Z0-9_\\-]+$'),
  fullNameMaxLength: userProps.fullName.maxLength ?? 100,
  emailMaxLength: userProps.email.maxLength ?? 150,
  emailPattern: new RegExp(userProps.email.pattern ?? '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'),
  phoneMinLength: 9,
  phoneMaxLength: userProps.phone.maxLength ?? 15,
  phonePattern: /^[0-9+\-\s]{9,15}$/,
  avatarMaxLength: userProps.avatar.maxLength ?? 500,
  cityMaxLength: userProps.city.maxLength ?? 100,
  districtMaxLength: userProps.district.maxLength ?? 100,
  addressMaxLength: userProps.address.maxLength ?? 250,
  joinedDateMaxLength: userProps.joinedDate.maxLength ?? 30,
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

const LEAKED_DEFAULT_ADDRESSES = new Set([
  '219/20 đường số 12, phường Bình Hưng Hòa',
  '123 Nguyễn Huệ, Phường Bến Nghé',
  '123 Nguyễn Huệ',
  'Địa chỉ chưa cập nhật',
]);

// Sanitize and validate UserProfile fields to guarantee adherence to firebase-blueprint.json
export function sanitizeUserProfileInput(input: Partial<UserProfile>, uid: string, emailFallback: string) {
  const safeUid = uid.slice(0, USER_VALIDATION_RULES.uidMaxLength);
  const rawName = (input.fullName || 'Khách hàng Nova').trim();
  const fullName = (rawName.length > 0 ? rawName : 'Khách hàng Nova').slice(
    0,
    USER_VALIDATION_RULES.fullNameMaxLength
  );

  const rawEmail = (input.email || emailFallback || 'member@novashop.vn').trim();
  const email = (USER_VALIDATION_RULES.emailPattern.test(rawEmail)
    ? rawEmail
    : 'member@novashop.vn'
  ).slice(0, USER_VALIDATION_RULES.emailMaxLength);

  const rawPhone = (input.phone || '').trim();
  const phone = USER_VALIDATION_RULES.phonePattern.test(rawPhone)
    ? rawPhone.slice(0, USER_VALIDATION_RULES.phoneMaxLength)
    : '';

  const avatar = (input.avatar || '').slice(0, USER_VALIDATION_RULES.avatarMaxLength);
  const city = (input.city || '').trim().slice(0, USER_VALIDATION_RULES.cityMaxLength);
  const district = (input.district || '').trim().slice(0, USER_VALIDATION_RULES.districtMaxLength);
  const rawAddress = (input.address || '').trim();
  const address = (LEAKED_DEFAULT_ADDRESSES.has(rawAddress) ? '' : rawAddress).slice(
    0,
    USER_VALIDATION_RULES.addressMaxLength
  );
  const joinedDate = (
    (input.joinedDate || new Date().toLocaleDateString('vi-VN')).trim() || '15/01/2024'
  ).slice(0, USER_VALIDATION_RULES.joinedDateMaxLength);

  return {
    uid: safeUid,
    fullName,
    email,
    phone,
    avatar,
    city,
    district,
    address,
    joinedDate,
  };
}

const inFlightProfileSyncs = new Map<string, Promise<UserProfile>>();

export async function syncFirebaseUserProfile(fbUser: FirebaseUser): Promise<UserProfile> {
  const existingSync = inFlightProfileSyncs.get(fbUser.uid);
  if (existingSync) {
    return existingSync;
  }

  const syncPromise = (async (): Promise<UserProfile> => {
    const userPath = `users/${fbUser.uid}`;
    const userRef = doc(db, 'users', fbUser.uid);

    let snapshot;
    try {
      snapshot = await getDoc(userRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, userPath);
    }

    if (snapshot && snapshot.exists()) {
      const data = snapshot.data();
      const hadLeakedDefault =
        data.phone === '0908061843' ||
        LEAKED_DEFAULT_ADDRESSES.has(data.address || '');

      const cleanPhone = hadLeakedDefault && data.phone === '0908061843' ? '' : (data.phone || '');
      const cleanCity = hadLeakedDefault ? '' : (data.city || '');
      const cleanDistrict = hadLeakedDefault ? '' : (data.district || '');
      const cleanAddress = LEAKED_DEFAULT_ADDRESSES.has(data.address || '') ? '' : (data.address || '');

      return {
        id: fbUser.uid,
        fullName: data.fullName || fbUser.displayName || 'Khách hàng Nova',
        email: data.email || fbUser.email || '',
        phone: cleanPhone,
        avatar: data.avatar || fbUser.photoURL || undefined,
        memberTier: data.memberTier || 'Bronze',
        novaPoints: typeof data.novaPoints === 'number' ? data.novaPoints : 1000,
        city: cleanCity,
        district: cleanDistrict,
        address: cleanAddress,
        joinedDate: data.joinedDate || new Date().toLocaleDateString('vi-VN'),
      };
    }

    const isBootstrappedVip = fbUser.email === 'truongminhquoctri@gmail.com';
    const sanitized = sanitizeUserProfileInput(
      {
        fullName: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Khách hàng Nova'),
        email: fbUser.email || 'member@novashop.vn',
        phone: fbUser.phoneNumber || '',
        avatar: fbUser.photoURL || '',
        city: '',
        district: '',
        address: '',
        joinedDate: new Date().toLocaleDateString('vi-VN'),
      },
      fbUser.uid,
      fbUser.email || 'member@novashop.vn'
    );

    const memberTier: UserProfile['memberTier'] = isBootstrappedVip ? 'Gold' : 'Bronze';
    const novaPoints = isBootstrappedVip ? 2450 : 1000;

    const newDocPayload = {
      ...sanitized,
      memberTier,
      novaPoints,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(userRef, newDocPayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, userPath);
    }

    return {
      id: fbUser.uid,
      fullName: sanitized.fullName,
      email: sanitized.email,
      phone: sanitized.phone,
      avatar: sanitized.avatar || undefined,
      memberTier,
      novaPoints,
      city: sanitized.city,
      district: sanitized.district,
      address: sanitized.address,
      joinedDate: sanitized.joinedDate,
    };
  })();

  inFlightProfileSyncs.set(fbUser.uid, syncPromise);
  try {
    return await syncPromise;
  } finally {
    inFlightProfileSyncs.delete(fbUser.uid);
  }
}

export async function updateFirestoreUserProfileDetails(updated: UserProfile): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== updated.id) {
    return;
  }
  const userPath = `users/${updated.id}`;
  const userRef = doc(db, 'users', updated.id);
  const sanitized = sanitizeUserProfileInput(updated, updated.id, updated.email);

  try {
    await updateDoc(userRef, {
      fullName: sanitized.fullName,
      phone: sanitized.phone,
      email: sanitized.email,
      avatar: sanitized.avatar,
      city: sanitized.city,
      district: sanitized.district,
      address: sanitized.address,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}

export async function updateFirestoreUserPoints(uid: string, nextPoints: number): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    return;
  }
  const safePoints = Math.min(1000000, Math.max(0, Math.round(nextPoints)));
  const userPath = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  try {
    await updateDoc(userRef, {
      novaPoints: safePoints,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}

export async function signInWithGooglePopup(): Promise<UserProfile> {
  const credential = await signInWithPopup(auth, googleProvider);
  return syncFirebaseUserProfile(credential.user);
}

export async function signOutFirebase(): Promise<void> {
  if (auth.currentUser) {
    await signOut(auth);
  }
}

export { onAuthStateChanged };
