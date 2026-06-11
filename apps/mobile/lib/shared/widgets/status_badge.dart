// lib/shared/widgets/status_badge.dart

import 'package:flutter/material.dart';
import '../../core/constants/app_constants.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final bool compact;

  const StatusBadge({super.key, required this.status, this.compact = false});

  @override
  Widget build(BuildContext context) {
    final meta = getStatusMeta(status);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 8 : 10,
        vertical: compact ? 3 : 5,
      ),
      decoration: BoxDecoration(
        color: meta.bgColor,
        borderRadius: BorderRadius.circular(100),
      ),
      child: Text(
        meta.label,
        style: TextStyle(
          fontSize: compact ? 10 : 11,
          fontWeight: FontWeight.w600,
          color: meta.color,
          letterSpacing: 0.2,
        ),
      ),
    );
  }
}
