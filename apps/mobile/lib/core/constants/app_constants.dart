// lib/core/constants/app_constants.dart

import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AppRoutes {
  static const String login = '/login';
  static const String dashboard = '/dashboard';
  static const String complaints = '/complaints';
  static const String complaintDetail = '/complaints/detail';
  static const String createComplaint = '/complaints/create';
  static const String profile = '/profile';
}

class AppStrings {
  static const String appName = 'CivicTrack';
  static const String tagline = 'Kerala Civic Connect';
  static const String loginTitle = 'Welcome back';
  static const String loginSubtitle =
      'Sign in to report and track civic issues in your area.';
  static const String emailLabel = 'Email address';
  static const String passwordLabel = 'Password';
  static const String signIn = 'Sign in';
  static const String signInWithGoogle = 'Continue with Google';
  static const String orDivider = 'or';
  static const String forgotPassword = 'Forgot password?';
  static const String noAccount = "Don't have an account? ";
  static const String signUp = 'Sign up';
  static const String dashboard = 'Dashboard';
  static const String myComplaints = 'My Complaints';
  static const String newComplaint = 'New Complaint';
  static const String profile = 'Profile';
}

class CategoryMeta {
  final String key;
  final String label;
  final IconData icon;
  final Color color;

  const CategoryMeta({
    required this.key,
    required this.label,
    required this.icon,
    required this.color,
  });
}

const List<CategoryMeta> kCategories = [
  CategoryMeta(
    key: 'road',
    label: 'Roads',
    icon: Icons.directions_car_outlined,
    color: AppColors.catRoad,
  ),
  CategoryMeta(
    key: 'water',
    label: 'Water',
    icon: Icons.water_drop_outlined,
    color: AppColors.catWater,
  ),
  CategoryMeta(
    key: 'electricity',
    label: 'Electricity',
    icon: Icons.bolt_outlined,
    color: AppColors.catElectricity,
  ),
  CategoryMeta(
    key: 'sanitation',
    label: 'Sanitation',
    icon: Icons.delete_outline,
    color: AppColors.catSanitation,
  ),
  CategoryMeta(
    key: 'public_safety',
    label: 'Safety',
    icon: Icons.shield_outlined,
    color: AppColors.catSafety,
  ),
  CategoryMeta(
    key: 'parks',
    label: 'Parks',
    icon: Icons.park_outlined,
    color: AppColors.catParks,
  ),
  CategoryMeta(
    key: 'noise',
    label: 'Noise',
    icon: Icons.volume_up_outlined,
    color: AppColors.catNoise,
  ),
  CategoryMeta(
    key: 'other',
    label: 'Other',
    icon: Icons.help_outline,
    color: AppColors.catOther,
  ),
];

CategoryMeta getCategoryMeta(String key) {
  return kCategories.firstWhere(
    (c) => c.key == key,
    orElse: () => kCategories.last,
  );
}

class StatusMeta {
  final String key;
  final String label;
  final Color color;
  final Color bgColor;

  const StatusMeta({
    required this.key,
    required this.label,
    required this.color,
    required this.bgColor,
  });
}

const Map<String, StatusMeta> kStatusMeta = {
  'pending': StatusMeta(
    key: 'pending',
    label: 'Pending',
    color: AppColors.pending,
    bgColor: Color(0xFFFFF3DC),
  ),
  'in_progress': StatusMeta(
    key: 'in_progress',
    label: 'In Progress',
    color: AppColors.inProgress,
    bgColor: Color(0xFFE3F2FD),
  ),
  'resolved': StatusMeta(
    key: 'resolved',
    label: 'Resolved',
    color: AppColors.resolved,
    bgColor: Color(0xFFE8F5E9),
  ),
  'rejected': StatusMeta(
    key: 'rejected',
    label: 'Rejected',
    color: AppColors.rejected,
    bgColor: Color(0xFFFFEBEE),
  ),
};

StatusMeta getStatusMeta(String key) {
  return kStatusMeta[key] ??
      const StatusMeta(
        key: 'pending',
        label: 'Pending',
        color: AppColors.pending,
        bgColor: Color(0xFFFFF3DC),
      );
}
