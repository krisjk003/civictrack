import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../widgets/stat_card.dart';
import '../widgets/hazard_card.dart';
import '../widgets/dashboard_header.dart';
import 'report_screen.dart';
import 'my_reports_screen.dart';
import 'profile_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;

  final List<Map<String, dynamic>> _recentReports = [
    {
      'title': 'Deep pothole near bus stand',
      'location': 'Palayam, Trivandrum',
      'type': 'road',
      'status': 'Under review',
      'date': '2 days ago',
      'icon': Icons.remove_road,
      'color': Colors.red,
    },
    {
      'title': 'Electric pole fallen on road',
      'location': 'Kazhakkoottam, Trivandrum',
      'type': 'electric',
      'status': 'Pending',
      'date': '5 days ago',
      'icon': Icons.electric_bolt,
      'color': Colors.amber,
    },
    {
      'title': 'Waterlogging after rain',
      'location': 'Vattiyoorkavu, Trivandrum',
      'type': 'water',
      'status': 'Resolved',
      'date': '1 week ago',
      'icon': Icons.water_drop,
      'color': Colors.blue,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final screens = [
      _buildHomeTab(),
      const Center(child: Text('Map coming soon')),
      const MyReportsScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF4F6FA),
      body: screens[_currentIndex],
      floatingActionButton: _currentIndex == 0
          ? FloatingActionButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ReportScreen()),
              ),
              backgroundColor: const Color(0xFF1A2B5E),
              child: const Icon(Icons.add, color: Colors.white),
            )
          : null,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF1A2B5E),
        unselectedItemColor: Colors.grey,
        backgroundColor: Colors.white,
        elevation: 8,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.map_outlined), activeIcon: Icon(Icons.map), label: 'Map'),
          BottomNavigationBarItem(icon: Icon(Icons.list_alt_outlined), activeIcon: Icon(Icons.list_alt), label: 'Reports'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  Widget _buildHomeTab() {
    final user = FirebaseAuth.instance.currentUser;
    final displayName = user?.displayName ?? user?.email?.split('@').first ?? 'User';

    return SafeArea(
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(child: DashboardHeader(displayName: displayName)),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                const SizedBox(height: 16),
                _buildStatRow(),
                const SizedBox(height: 20),
                _buildSectionTitle('Quick actions'),
                const SizedBox(height: 12),
                _buildQuickActions(),
                const SizedBox(height: 20),
                _buildSectionTitle('Recent reports', showSeeAll: true),
                const SizedBox(height: 12),
                ..._recentReports.map((r) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: HazardCard(report: r),
                )),
                const SizedBox(height: 20),
                _buildAlertBanner(),
                const SizedBox(height: 80),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatRow() {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.5,
      children: const [
        StatCard(label: 'My reports', value: '12', icon: Icons.description_outlined, iconColor: Color(0xFF1A2B5E), bgColor: Color(0xFFEBF2FF)),
        StatCard(label: 'Pending', value: '4', icon: Icons.schedule, iconColor: Color(0xFFC07000), bgColor: Color(0xFFFFF7E6)),
        StatCard(label: 'Resolved', value: '7', icon: Icons.check_circle_outline, iconColor: Color(0xFF166534), bgColor: Color(0xFFEDFAF2)),
        StatCard(label: 'Urgent', value: '1', icon: Icons.warning_amber_outlined, iconColor: Color(0xFFB91C1C), bgColor: Color(0xFFFEF2F2)),
      ],
    );
  }

  Widget _buildSectionTitle(String title, {bool showSeeAll = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF1A1A2E))),
        if (showSeeAll)
          GestureDetector(
            onTap: () => setState(() => _currentIndex = 2),
            child: const Text('See all', style: TextStyle(fontSize: 12, color: Color(0xFF1A2B5E))),
          ),
      ],
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      {'label': 'Report issue', 'sub': 'Submit a new problem', 'icon': Icons.add, 'bgColor': const Color(0xFF1A2B5E), 'iconColor': Colors.white},
      {'label': 'My reports', 'sub': 'Track your submissions', 'icon': Icons.list_alt, 'bgColor': const Color(0xFFFFF7E6), 'iconColor': const Color(0xFFC07000)},
      {'label': 'Nearby issues', 'sub': 'See area problems', 'icon': Icons.location_on_outlined, 'bgColor': const Color(0xFFEDFAF2), 'iconColor': const Color(0xFF166534)},
      {'label': 'My profile', 'sub': 'Edit your details', 'icon': Icons.person_outline, 'bgColor': const Color(0xFFF5F0FF), 'iconColor': const Color(0xFF5B21B6)},
    ];

    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.3,
      children: actions.map((a) {
        return GestureDetector(
          onTap: () {
            if (a['label'] == 'Report issue') {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const ReportScreen()));
            } else if (a['label'] == 'My reports') {
              setState(() => _currentIndex = 2);
            } else if (a['label'] == 'My profile') {
              setState(() => _currentIndex = 3);
            }
          },
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.grey.shade200),
            ),
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(color: a['bgColor'] as Color, borderRadius: BorderRadius.circular(10)),
                  child: Icon(a['icon'] as IconData, color: a['iconColor'] as Color, size: 20),
                ),
                const SizedBox(height: 8),
                Text(a['label'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                Text(a['sub'] as String, style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildAlertBanner() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1A2B5E),
        borderRadius: BorderRadius.circular(14),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Kerala Civic Connect', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                SizedBox(height: 4),
                Text('Monsoon alert mode active', style: TextStyle(color: Colors.white70, fontSize: 12)),
              ],
            ),
          ),
          TextButton(
            onPressed: () {},
            style: TextButton.styleFrom(
              backgroundColor: Colors.white24,
              shape: const StadiumBorder(),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            ),
            child: const Text('Learn more', style: TextStyle(color: Colors.white, fontSize: 12)),
          ),
        ],
      ),
    );
  }
}
