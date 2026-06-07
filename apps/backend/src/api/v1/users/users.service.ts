// src/api/v1/users/users.service.ts

import { FieldValue } from 'firebase-admin/firestore';
import { firestore } from '../../../config/firebase.config';
import { Collections } from '../../../config/database.config';
import { NotFoundError } from '../../../shared/errors/http-errors';
import { UserRole } from '../../../shared/types/roles.types';
import { AuthenticatedUser } from '../../../shared/types/express.d';
import { UpdateUserDto } from './dto/update-user.dto';

export interface UserDocument {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export class UsersService {
  private get collection() {
    return firestore.collection(Collections.USERS);
  }

  /**
   * Fetch the current user's profile.
   * If no Firestore document exists yet, creates one using Firebase Auth data.
   */
  async getMe(user: AuthenticatedUser): Promise<UserDocument> {
    const doc = await this.collection.doc(user.uid).get();

    if (!doc.exists) {
      return this.upsertProfile(user);
    }

    return { ...(doc.data() as UserDocument), uid: user.uid };
  }

  /**
   * Update the current user's profile fields.
   */
  async updateMe(
    dto: UpdateUserDto,
    user: AuthenticatedUser,
  ): Promise<UserDocument> {
    const docRef = this.collection.doc(user.uid);
    const doc = await docRef.get();

    const now = FieldValue.serverTimestamp();

    if (!doc.exists) {
      // First time writing profile — create the document
      const newProfile = {
        uid: user.uid,
        email: user.email,
        name: dto.name ?? user.name ?? '',
        role: UserRole.CITIZEN,
        createdAt: now,
        updatedAt: now,
      };
      await docRef.set(newProfile);
    } else {
      const updateFields: Record<string, unknown> = { updatedAt: now };
      if (dto.name !== undefined) updateFields['name'] = dto.name;
      await docRef.update(updateFields);
    }

    const updated = await docRef.get();
    return { ...(updated.data() as UserDocument), uid: user.uid };
  }

  /**
   * Internal helper: creates a Firestore user document from auth token data.
   */
  private async upsertProfile(user: AuthenticatedUser): Promise<UserDocument> {
    const docRef = this.collection.doc(user.uid);
    const now = FieldValue.serverTimestamp();

    const profile = {
      uid: user.uid,
      email: user.email,
      name: user.name ?? '',
      role: UserRole.CITIZEN,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(profile, { merge: true });

    const snapshot = await docRef.get();
    return { ...(snapshot.data() as UserDocument), uid: user.uid };
  }

  /**
   * Internal helper used by admin module.
   */
  async findById(uid: string): Promise<UserDocument> {
    const doc = await this.collection.doc(uid).get();
    if (!doc.exists) {
      throw new NotFoundError(`User with uid "${uid}" not found`);
    }
    return { ...(doc.data() as UserDocument), uid };
  }
}

export const usersService = new UsersService();