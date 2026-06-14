// src/api/v1/admin/admin.service.ts

import { firestore } from '../../../config/firebase.config';
import { Collections } from '../../../config/database.config';
import { FieldValue } from "firebase-admin/firestore";

export interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  rejectedComplaints: number;
  totalUsers: number;
}

export class AdminService {
  private get complaintsCollection() {
    return firestore.collection(Collections.HAZARDS);
  }

  private get usersCollection() {
    return firestore.collection(Collections.USERS);
  }

  private get adminProfilesCollection() {
    return firestore.collection(
      Collections.ADMINS
    );
  }

  /**
   * Aggregates complaint counts per status in parallel using
   * Firestore's AggregateQuery (count) — no full document reads needed.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    // Run all count queries in parallel for performance
    const [
      totalSnap,
      pendingSnap,
      inProgressSnap,
      resolvedSnap,
      rejectedSnap,
      usersSnap,
    ] = await Promise.all([
      this.complaintsCollection.count().get(),
      this.complaintsCollection.where('status', '==', 'pending').count().get(),
      this.complaintsCollection.where('status', '==', 'in_progress').count().get(),
      this.complaintsCollection.where('status', '==', 'resolved').count().get(),
      this.complaintsCollection.where('status', '==', 'rejected').count().get(),
      this.usersCollection.count().get(),
    ]);

    return {
      totalComplaints: totalSnap.data().count,
      pendingComplaints: pendingSnap.data().count,
      inProgressComplaints: inProgressSnap.data().count,
      resolvedComplaints: resolvedSnap.data().count,
      rejectedComplaints: rejectedSnap.data().count,
      totalUsers: usersSnap.data().count,
    };
  }
  async updateProfile(
    uid: string,
    dto: {
      name: string;
      phone: string;
      department: string;
      state: string;
      district: string;
      locality: string;
    }
  ): Promise<void> {

    await this.adminProfilesCollection
      .doc(uid)
      .set(
        {
          ...dto,
          profileCompleted: true,
        },
        { merge: true }
      );

    await firestore
      .collection(Collections.AUDIT_LOGS)
      .add({
        action: "admin.profile_updated",
        userId: uid,
        timestamp:
          FieldValue.serverTimestamp(),
      });
  }

}

export const adminService = new AdminService();