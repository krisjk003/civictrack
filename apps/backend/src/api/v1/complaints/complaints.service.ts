// src/api/v1/complaints/complaints.service.ts

import { FieldValue } from 'firebase-admin/firestore';
import { firestore } from '../../../config/firebase.config';
import { Collections } from '../../../config/database.config';
import { NotFoundError, ForbiddenError } from '../../../shared/errors/http-errors';
import { UserRole } from '../../../shared/types/roles.types';
import { AuthenticatedUser } from '../../../shared/types/express.d';
import {
  CreateComplaintDto,
  ComplaintStatusType,
  ComplaintPriorityType,
} from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint.dto';

export interface ComplaintDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrls: string[];
  latitude: number;
  longitude: number;
  status: ComplaintStatusType;
  priority: ComplaintPriorityType;
  createdBy: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface ListComplaintsOptions {
  status?: ComplaintStatusType;
  category?: string;
  createdBy?: string;
  limit?: number;
  page?: number;
}

export class ComplaintsService {
  private get collection() {
    return firestore.collection(Collections.HAZARDS);
  }

  async create(
    dto: CreateComplaintDto,
    user: AuthenticatedUser,
  ): Promise<ComplaintDocument> {
    const now = FieldValue.serverTimestamp();

    const docRef = this.collection.doc();

    const data = {
      id: docRef.id,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      imageUrls: dto.imageUrls,
      latitude: dto.latitude,
      longitude: dto.longitude,
      status: 'pending' as ComplaintStatusType,
      priority: 'medium' as ComplaintPriorityType,
      createdBy: user.uid,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(data);

    await this.writeAuditLog({
      action: 'complaint.created',
      userId: user.uid,
      entityType: 'complaint',
      entityId: docRef.id,
    });

    // Re-fetch to get server timestamps resolved
    const snapshot = await docRef.get();
    return { ...(snapshot.data() as ComplaintDocument), id: docRef.id };
  }

  async findAll(
    options: ListComplaintsOptions,
    requestingUser: AuthenticatedUser,
  ): Promise<{ data: ComplaintDocument[]; total: number }> {
    const { status, category, limit = 20, page = 1 } = options;

    let query: FirebaseFirestore.Query = this.collection;

    // Citizens can only see their own complaints
    if (requestingUser.role === UserRole.CITIZEN) {
      query = query.where('createdBy', '==', requestingUser.uid);
    }

    if (status) {
      query = query.where('status', '==', status);
    }

    if (category) {
      query = query.where('category', '==', category);
    }

    query = query.orderBy('createdAt', 'desc');

    // Count query (Firestore doesn't support COUNT natively without AggregateQuery)
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // Paginated results
    const offset = (page - 1) * limit;
    const snapshot = await query.limit(limit).offset(offset).get();

    const data = snapshot.docs.map((doc) => ({
      ...(doc.data() as ComplaintDocument),
      id: doc.id,
    }));

    return { data, total };
  }

  async findById(id: string, requestingUser: AuthenticatedUser): Promise<ComplaintDocument> {
    const doc = await this.collection.doc(id).get();

    if (!doc.exists) {
      throw new NotFoundError(`Complaint with id "${id}" not found`);
    }

    const complaint = { ...(doc.data() as ComplaintDocument), id: doc.id };

    // Citizens can only view their own complaints
    if (
      requestingUser.role === UserRole.CITIZEN &&
      complaint.createdBy !== requestingUser.uid
    ) {
      throw new ForbiddenError('You do not have permission to view this complaint');
    }

    return complaint;
  }

  async updateStatus(
    id: string,
    dto: UpdateComplaintStatusDto,
    requestingUser: AuthenticatedUser,
  ): Promise<ComplaintDocument> {
    const doc = await this.collection.doc(id).get();

    if (!doc.exists) {
      throw new NotFoundError(`Complaint with id "${id}" not found`);
    }

    const updateData: Record<string, unknown> = {
      status: dto.status,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (dto.priority !== undefined) {
      updateData['priority'] = dto.priority;
    }

    await this.collection.doc(id).update(updateData);

    await this.writeAuditLog({
      action: 'complaint.status_updated',
      userId: requestingUser.uid,
      entityType: 'complaint',
      entityId: id,
    });

    const updated = await this.collection.doc(id).get();
    return { ...(updated.data() as ComplaintDocument), id };
  }

  private async writeAuditLog(entry: {
    action: string;
    userId: string;
    entityType: string;
    entityId: string;
  }): Promise<void> {
    const logRef = firestore.collection(Collections.AUDIT_LOGS).doc();
    await logRef.set({
      id: logRef.id,
      ...entry,
      timestamp: FieldValue.serverTimestamp(),
    });
  }
}

export const complaintsService = new ComplaintsService();