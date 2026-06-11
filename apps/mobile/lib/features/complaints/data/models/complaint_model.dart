// lib/features/complaints/data/models/complaint_model.dart

import 'package:cloud_firestore/cloud_firestore.dart';

class ComplaintModel {
  final String id;
  final String title;
  final String description;
  final String category;
  final List<String> imageUrls;
  final double latitude;
  final double longitude;
  final String status;
  final String priority;
  final String createdBy;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  ComplaintModel({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.imageUrls,
    required this.latitude,
    required this.longitude,
    required this.status,
    required this.priority,
    required this.createdBy,
    this.createdAt,
    this.updatedAt,
  });

  factory ComplaintModel.fromMap(Map<String, dynamic> map, String docId) {
    return ComplaintModel(
      id: docId,
      title: map['title'] as String? ?? '',
      description: map['description'] as String? ?? '',
      category: map['category'] as String? ?? 'other',
      imageUrls: List<String>.from(map['imageUrls'] as List? ?? []),
      latitude: (map['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (map['longitude'] as num?)?.toDouble() ?? 0.0,
      status: map['status'] as String? ?? 'pending',
      priority: map['priority'] as String? ?? 'medium',
      createdBy: map['createdBy'] as String? ?? '',
      createdAt: (map['createdAt'] as Timestamp?)?.toDate(),
      updatedAt: (map['updatedAt'] as Timestamp?)?.toDate(),
    );
  }

  factory ComplaintModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return ComplaintModel.fromMap(data, doc.id);
  }

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'description': description,
      'category': category,
      'imageUrls': imageUrls,
      'latitude': latitude,
      'longitude': longitude,
      'status': status,
      'priority': priority,
      'createdBy': createdBy,
    };
  }

  ComplaintModel copyWith({
    String? id,
    String? title,
    String? description,
    String? category,
    List<String>? imageUrls,
    double? latitude,
    double? longitude,
    String? status,
    String? priority,
    String? createdBy,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ComplaintModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      category: category ?? this.category,
      imageUrls: imageUrls ?? this.imageUrls,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      status: status ?? this.status,
      priority: priority ?? this.priority,
      createdBy: createdBy ?? this.createdBy,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
