// lib/features/dashboard/presentation/screens/dashboard_screen.dart

import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../features/auth/data/auth_service.dart';
import '../../../../shared/widgets/status_badge.dart';
import '../../../../features/complaints/data/models/complaint_model.dart';
import 'package:mobile/features/auth/presentation/screens/login_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedIndex = 0;

  final List<Widget> _pages = const [
    _HomeTab(),
    _MyComplaintsTab(),
    _ProfileTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: IndexedStack(index: _selectedIndex, children: _pages),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppColors.border, width: 1)),
        ),
        child: NavigationBar(
          selectedIndex: _selectedIndex,
          onDestinationSelected: (i) => setState(() => _selectedIndex = i),
          backgroundColor: AppColors.surface,
          surfaceTintColor: Colors.transparent,
          indicatorColor: AppColors.primary.withValues(alpha: 0.10),
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          height: 64,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home_rounded, color: AppColors.primary),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.list_alt_outlined),
              selectedIcon: Icon(
                Icons.list_alt_rounded,
                color: AppColors.primary,
              ),
              label: 'My Reports',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline_rounded),
              selectedIcon: Icon(
                Icons.person_rounded,
                color: AppColors.primary,
              ),
              label: 'Profile',
            ),
          ],
        ),
      ),
      floatingActionButton: _selectedIndex == 0 || _selectedIndex == 1
          ? FloatingActionButton.extended(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('New complaint screen — coming soon'),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
              backgroundColor: AppColors.accent,
              foregroundColor: Colors.white,
              elevation: 2,
              icon: const Icon(Icons.add_rounded),
              label: const Text(
                'Report Issue',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            )
          : null,
    );
  }
}

// ─── Home Tab ────────────────────────────────────────────────────────────────

class _HomeTab extends StatelessWidget {
  const _HomeTab();

  @override
  Widget build(BuildContext context) {
    final user = AuthService.currentUser;

    return CustomScrollView(
      slivers: [
        // App bar
        SliverAppBar(
          expandedHeight: 130,
          floating: false,
          pinned: true,
          backgroundColor: AppColors.primary,
          flexibleSpace: FlexibleSpaceBar(
            background: Padding(
              padding: const EdgeInsets.fromLTRB(20, 60, 20, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    'Hello, ${user?.displayName?.split(' ').first ?? 'Citizen'} 👋',
                    style: const TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Track civic issues in your neighbourhood',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 13,
                      color: Colors.white.withValues(alpha: 0.75),
                    ),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.accent,
                child: Text(
                  (user?.displayName?.isNotEmpty == true
                          ? user!.displayName![0]
                          : user?.email?[0] ?? 'C')
                      .toUpperCase(),
                  style: const TextStyle(
                    fontFamily: 'Inter',
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                  ),
                ),
              ),
            ),
          ],
        ),

        // Stats row
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
            child: _StatsRow(),
          ),
        ),

        // Section title
        const SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.fromLTRB(20, 24, 20, 12),
            child: Text(
              'Recent Reports',
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          ),
        ),

        // Recent complaints stream
        SliverToBoxAdapter(child: _RecentComplaintsList()),

        const SliverToBoxAdapter(child: SizedBox(height: 100)),
      ],
    );
  }
}

class _StatsRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final uid = AuthService.currentUser?.uid;

    return StreamBuilder<QuerySnapshot>(
      stream: uid == null
          ? const Stream.empty()
          : FirebaseFirestore.instance
                .collection('complaints')
                .where('createdBy', isEqualTo: uid)
                .snapshots(),
      builder: (context, snapshot) {
        final docs = snapshot.data?.docs ?? [];

        int pending = 0, inProgress = 0, resolved = 0;
        for (final d in docs) {
          final status =
              (d.data() as Map<String, dynamic>)['status'] as String? ?? '';
          if (status == 'pending') pending++;
          if (status == 'in_progress') inProgress++;
          if (status == 'resolved') resolved++;
        }

        return Row(
          children: [
            _StatCard(
              label: 'Total',
              value: docs.length,
              color: AppColors.primary,
              icon: Icons.bar_chart_rounded,
            ),
            const SizedBox(width: 10),
            _StatCard(
              label: 'Pending',
              value: pending,
              color: AppColors.pending,
              icon: Icons.schedule_rounded,
            ),
            const SizedBox(width: 10),
            _StatCard(
              label: 'In Progress',
              value: inProgress,
              color: AppColors.inProgress,
              icon: Icons.autorenew_rounded,
            ),
            const SizedBox(width: 10),
            _StatCard(
              label: 'Resolved',
              value: resolved,
              color: AppColors.resolved,
              icon: Icons.check_circle_outline_rounded,
            ),
          ],
        );
      },
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final int value;
  final Color color;
  final IconData icon;

  const _StatCard({
    required this.label,
    required this.value,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(height: 8),
            Text(
              '$value',
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: color,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 10,
                fontWeight: FontWeight.w500,
                color: AppColors.textHint,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RecentComplaintsList extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance
          .collection('complaints')
          .orderBy('createdAt', descending: true)
          .limit(10)
          .snapshots(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(32),
              child: CircularProgressIndicator(color: AppColors.primary),
            ),
          );
        }

        final docs = snapshot.data?.docs ?? [];

        if (docs.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 32),
              child: Column(
                children: [
                  Icon(
                    Icons.inbox_outlined,
                    size: 48,
                    color: AppColors.textHint,
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'No reports yet',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Tap "Report Issue" to submit your first civic complaint.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 13, color: AppColors.textHint),
                  ),
                ],
              ),
            ),
          );
        }

        return ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: docs.length,
          separatorBuilder: (_, __) => const SizedBox(height: 10),
          itemBuilder: (context, i) {
            final complaint = ComplaintModel.fromFirestore(docs[i]);
            return _ComplaintCard(complaint: complaint);
          },
        );
      },
    );
  }
}

class _ComplaintCard extends StatelessWidget {
  final ComplaintModel complaint;

  const _ComplaintCard({required this.complaint});

  @override
  Widget build(BuildContext context) {
    final meta = getCategoryMeta(complaint.category);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Category icon
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: meta.color.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(meta.icon, size: 20, color: meta.color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        complaint.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    StatusBadge(status: complaint.status, compact: true),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  complaint.description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Icon(
                      Icons.calendar_today_outlined,
                      size: 11,
                      color: AppColors.textHint,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      complaint.createdAt != null
                          ? _formatDate(complaint.createdAt!)
                          : '—',
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.textHint,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: meta.color.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        meta.label,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: meta.color,
                        ),
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

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inDays == 0) return 'Today';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}

// ─── My Complaints Tab ───────────────────────────────────────────────────────

class _MyComplaintsTab extends StatefulWidget {
  const _MyComplaintsTab();

  @override
  State<_MyComplaintsTab> createState() => _MyComplaintsTabState();
}

class _MyComplaintsTabState extends State<_MyComplaintsTab> {
  String _filter = 'all';

  final _filters = const [
    ('all', 'All'),
    ('pending', 'Pending'),
    ('in_progress', 'In Progress'),
    ('resolved', 'Resolved'),
    ('rejected', 'Rejected'),
  ];

  @override
  Widget build(BuildContext context) {
    final uid = AuthService.currentUser?.uid;

    return Column(
      children: [
        // AppBar area
        Container(
          color: AppColors.primary,
          child: SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
              child: Row(
                children: [
                  const Text(
                    'My Reports',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      letterSpacing: -0.3,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),

        // Filter chips
        Container(
          color: AppColors.surface,
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: _filters.map((f) {
                final selected = _filter == f.$1;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(f.$2),
                    selected: selected,
                    onSelected: (_) => setState(() => _filter = f.$1),
                    backgroundColor: AppColors.surfaceElevated,
                    selectedColor: AppColors.primary.withValues(alpha: 0.12),
                    checkmarkColor: AppColors.primary,
                    labelStyle: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: selected
                          ? AppColors.primary
                          : AppColors.textSecondary,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                      side: BorderSide(
                        color: selected ? AppColors.primary : AppColors.border,
                        width: 1,
                      ),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                  ),
                );
              }).toList(),
            ),
          ),
        ),

        const Divider(height: 1),

        // List
        Expanded(
          child: StreamBuilder<QuerySnapshot>(
            stream: uid == null
                ? const Stream.empty()
                : (_filter == 'all'
                      ? FirebaseFirestore.instance
                            .collection('complaints')
                            .where('createdBy', isEqualTo: uid)
                            .orderBy('createdAt', descending: true)
                            .snapshots()
                      : FirebaseFirestore.instance
                            .collection('complaints')
                            .where('createdBy', isEqualTo: uid)
                            .where('status', isEqualTo: _filter)
                            .orderBy('createdAt', descending: true)
                            .snapshots()),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(
                  child: CircularProgressIndicator(color: AppColors.primary),
                );
              }

              final docs = snapshot.data?.docs ?? [];

              if (docs.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.assignment_outlined,
                        size: 52,
                        color: AppColors.textHint,
                      ),
                      const SizedBox(height: 14),
                      Text(
                        _filter == 'all'
                            ? 'No reports yet'
                            : 'No ${_filter.replaceAll('_', ' ')} reports',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                );
              }

              return ListView.separated(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 100),
                itemCount: docs.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, i) {
                  final complaint = ComplaintModel.fromFirestore(docs[i]);
                  return _ComplaintCard(complaint: complaint);
                },
              );
            },
          ),
        ),
      ],
    );
  }
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────

class _ProfileTab extends StatelessWidget {
  const _ProfileTab();

  @override
  Widget build(BuildContext context) {
    final user = AuthService.currentUser;

    return Column(
      children: [
        // Header
        Container(
          color: AppColors.primary,
          child: SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: AppColors.accent,
                    child: Text(
                      (user?.displayName?.isNotEmpty == true
                              ? user!.displayName![0]
                              : user?.email?[0] ?? 'C')
                          .toUpperCase(),
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.displayName ?? 'Citizen',
                          style: const TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          user?.email ?? '',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 13,
                            color: Colors.white.withValues(alpha: 0.75),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),

        const SizedBox(height: 20),

        // Menu items
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                _ProfileMenuItem(
                  icon: Icons.person_outline_rounded,
                  label: 'Edit Profile',
                  onTap: () {},
                ),
                const Divider(height: 1, indent: 52),
                _ProfileMenuItem(
                  icon: Icons.notifications_outlined,
                  label: 'Notifications',
                  onTap: () {},
                ),
                const Divider(height: 1, indent: 52),
                _ProfileMenuItem(
                  icon: Icons.help_outline_rounded,
                  label: 'Help & Support',
                  onTap: () {},
                ),
                const Divider(height: 1, indent: 52),
                _ProfileMenuItem(
                  icon: Icons.info_outline_rounded,
                  label: 'About CivicTrack',
                  onTap: () {},
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Sign out
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: SizedBox(
            width: double.infinity,
            height: 50,
            child: OutlinedButton.icon(
              onPressed: () async {
                await AuthService.signOut();
                if (context.mounted) {
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                    (_) => false,
                  );
                }
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.rejected,
                side: const BorderSide(color: AppColors.rejected, width: 1.2),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              icon: const Icon(Icons.logout_rounded, size: 18),
              label: const Text(
                'Sign Out',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontWeight: FontWeight.w600,
                  fontSize: 15,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ProfileMenuItem({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Icon(icon, size: 20, color: AppColors.textSecondary),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
            const Icon(
              Icons.chevron_right_rounded,
              size: 20,
              color: AppColors.textHint,
            ),
          ],
        ),
      ),
    );
  }
}
