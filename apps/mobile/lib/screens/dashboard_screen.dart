import 'package:flutter/material.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),

          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [

              // Header
              Row(
                children: [
                  const CircleAvatar(
                    radius: 28,
                    backgroundColor: Color(0xFF2563EB),
                    child: Icon(
                      Icons.person,
                      color: Colors.white,
                      size: 30,
                    ),
                  ),

                  const SizedBox(width: 15),

                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        "Welcome Back 👋",
                        style: TextStyle(
                          fontSize: 15,
                          color: Colors.grey,
                        ),
                      ),

                      Text(
                        "Citizen",
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 30),

              const Text(
                "Dashboard",
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                ),
              ),

              const SizedBox(height: 20),

              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 15,
                mainAxisSpacing: 15,
                childAspectRatio: 1.3,

                children: const [
                  StatCard(
                    title: "Reports",
                    value: "12",
                    icon: Icons.report_problem,
                  ),
                  StatCard(
                    title: "Pending",
                    value: "4",
                    icon: Icons.pending_actions,
                  ),
                  StatCard(
                    title: "Resolved",
                    value: "8",
                    icon: Icons.check_circle,
                  ),
                  StatCard(
                    title: "Nearby",
                    value: "15",
                    icon: Icons.location_on,
                  ),
                ],
              ),

              const SizedBox(height: 30),

              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton.icon(
                  onPressed: () {},

                  icon: const Icon(Icons.add),

                  label: const Text(
                    "Report New Hazard",
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 30),

              const Text(
                "Recent Reports",
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),

              const SizedBox(height: 15),

              const ReportTile(
                title: "Pothole near Main Road",
                status: "Pending",
              ),

              const ReportTile(
                title: "Broken Street Light",
                status: "Resolved",
              ),

              const ReportTile(
                title: "Garbage Accumulation",
                status: "In Progress",
              ),
            ],
          ),
        ),
      ),

      bottomNavigationBar: BottomNavigationBar(
        currentIndex: selectedIndex,

        onTap: (index) {
          setState(() {
            selectedIndex = index;
          });
        },

        selectedItemColor: const Color(0xFF2563EB),

        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: "Home",
          ),

          BottomNavigationBarItem(
            icon: Icon(Icons.add_circle),
            label: "Report",
          ),

          BottomNavigationBarItem(
            icon: Icon(Icons.list_alt),
            label: "Reports",
          ),

          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: "Profile",
          ),
        ],
      ),
    );
  }
}

class StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;

  const StatCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),

      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
          ),
        ],
      ),

      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            color: const Color(0xFF2563EB),
            size: 32,
          ),

          const SizedBox(height: 10),

          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),

          Text(
            title,
            style: const TextStyle(
              color: Colors.grey,
            ),
          ),
        ],
      ),
    );
  }
}

class ReportTile extends StatelessWidget {
  final String title;
  final String status;

  const ReportTile({
    super.key,
    required this.title,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),

      elevation: 2,

      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
      ),

      child: ListTile(
        leading: const Icon(
          Icons.warning_amber_rounded,
          color: Colors.orange,
        ),

        title: Text(title),

        subtitle: Text(status),

        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      ),
    );
  }
}
