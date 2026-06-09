import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../widgets/hazard_card.dart';

class MyReportsScreen extends StatelessWidget {
  const MyReportsScreen({super.key});

  IconData _iconForCategory(String category) {
    switch (category.toLowerCase()) {
      case 'road': return Icons.remove_road;
      case 'electric': return Icons.electric_bolt;
      case 'water': return Icons.water_drop;
      case 'drainage': return Icons.waves;
      case 'tree fall': return Icons.park;
      default: return Icons.report_problem_outlined;
    }
  }

  Color _colorForCategory(String category) {
    switch (category.toLowerCase()) {
      case 'road': return Colors.red;
      case 'electric': return Colors.amber;
      case 'water': return Colors.blue;
      case 'drainage': return Colors.teal;
      case 'tree fall': return Colors.green;
      default: return Colors.purple;
    }
  }

  String _timeAgo(Timestamp? ts) {
    if (ts == null) return '';
    final diff = DateTime.now().difference(ts.toDate());
    if (diff.inDays >= 7) return '${(diff.inDays / 7).floor()} week(s) ago';
    if (diff.inDays >= 1) return '${diff.inDays} day(s) ago';
    if (diff.inHours >= 1) return '${diff.inHours} hour(s) ago';
    return 'Just now';
  }

  @override
  Widget build(BuildContext context) {
    final userId = FirebaseAuth.instance.currentUser?.uid;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F6FA),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A2B5E),
        foregroundColor: Colors.white,
        title: const Text('My reports', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance
            .collection('reports')
            .where('userId', isEqualTo: userId)
            .orderBy('createdAt', descending: true)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFF1A2B5E)));
          }

          if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.inbox_outlined, size: 60, color: Colors.grey.shade400),
                  const SizedBox(height: 12),
                  const Text('No reports yet', style: TextStyle(color: Colors.grey, fontSize: 15)),
                  const SizedBox(height: 6),
                  const Text('Tap + to report your first issue', style: TextStyle(color: Colors.grey, fontSize: 13)),
                ],
              ),
            );
          }

          final docs = snapshot.data!.docs;
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: docs.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, i) {
              final data = docs[i].data() as Map<String, dynamic>;
              final category = data['category'] as String? ?? 'Other';
              return HazardCard(report: {
                'title': data['title'] ?? 'Untitled',
                'location': data['location'] ?? 'Unknown location',
                'status': data['status'] ?? 'Pending',
                'date': _timeAgo(data['createdAt'] as Timestamp?),
                'icon': _iconForCategory(category),
                'color': _colorForCategory(category),
              });
            },
          );
        },
      ),
    );
  }
}
