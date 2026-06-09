import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/auth_service.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    final displayName = user?.displayName ?? user?.email?.split('@').first ?? 'User';
    final initials = displayName.length >= 2
        ? displayName.substring(0, 2).toUpperCase()
        : displayName.toUpperCase();

    return Scaffold(
      backgroundColor: const Color(0xFFF4F6FA),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A2B5E),
        foregroundColor: Colors.white,
        title: const Text('Profile', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const SizedBox(height: 12),
          Center(
            child: Column(
              children: [
                CircleAvatar(
                  radius: 40,
                  backgroundColor: const Color(0xFF3B5FC0),
                  child: Text(initials, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w600)),
                ),
                const SizedBox(height: 12),
                Text(displayName, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Color(0xFF1A1A2E))),
                const SizedBox(height: 4),
                Text(user?.email ?? '', style: const TextStyle(fontSize: 13, color: Colors.grey)),
              ],
            ),
          ),
          const SizedBox(height: 28),
          _buildSection('Account', [
            _buildTile(Icons.person_outline, 'Edit profile', onTap: () {}),
            _buildTile(Icons.notifications_outlined, 'Notifications', onTap: () {}),
            _buildTile(Icons.lock_outline, 'Change password', onTap: () {}),
          ]),
          const SizedBox(height: 16),
          _buildSection('Support', [
            _buildTile(Icons.help_outline, 'Help & FAQ', onTap: () {}),
            _buildTile(Icons.info_outline, 'About', onTap: () {}),
          ]),
          const SizedBox(height: 16),
          _buildSection('', [
            _buildTile(
              Icons.logout,
              'Sign out',
              color: Colors.red,
              onTap: () async {
                await AuthService().signOut();
                if (context.mounted) {
                  Navigator.of(context).pushNamedAndRemoveUntil('/login', (_) => false);
                }
              },
            ),
          ]),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildSection(String title, List<Widget> tiles) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (title.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(bottom: 8, left: 4),
            child: Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w600)),
          ),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(children: tiles),
        ),
      ],
    );
  }

  Widget _buildTile(IconData icon, String label, {VoidCallback? onTap, Color? color}) {
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, size: 20, color: color ?? const Color(0xFF1A2B5E)),
      title: Text(label, style: TextStyle(fontSize: 14, color: color ?? const Color(0xFF1A1A2E))),
      trailing: color == null ? Icon(Icons.chevron_right, color: Colors.grey.shade400, size: 18) : null,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
    );
  }
}
