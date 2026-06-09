import 'package:flutter/material.dart';

class HazardCard extends StatelessWidget {
  final Map<String, dynamic> report;

  const HazardCard({super.key, required this.report});

  Color get _statusColor {
    switch (report['status']) {
      case 'Resolved':
        return const Color(0xFF166534);
      case 'Under review':
        return const Color(0xFF1D4ED8);
      default:
        return const Color(0xFF92400E);
    }
  }

  Color get _statusBg {
    switch (report['status']) {
      case 'Resolved':
        return const Color(0xFFF0FDF4);
      case 'Under review':
        return const Color(0xFFEFF6FF);
      default:
        return const Color(0xFFFFF7E6);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      padding: const EdgeInsets.all(14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: (report['color'] as Color).withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(report['icon'] as IconData, color: report['color'] as Color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  report['title'] as String,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1A1A2E)),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 11, color: Colors.grey),
                    const SizedBox(width: 2),
                    Expanded(
                      child: Text(
                        report['location'] as String,
                        style: const TextStyle(fontSize: 11, color: Colors.grey),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(report['date'] as String, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: _statusBg, borderRadius: BorderRadius.circular(20)),
                      child: Text(
                        report['status'] as String,
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: _statusColor),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
