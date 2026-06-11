// lib/features/auth/presentation/widgets/google_sign_in_button.dart

import 'package:flutter/material.dart';
import '../../../../../core/theme/app_theme.dart';

class GoogleSignInButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final bool isLoading;

  const GoogleSignInButton({
    super.key,
    required this.onPressed,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 50,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          backgroundColor: AppColors.surface,
          side: const BorderSide(color: AppColors.border, width: 1.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: isLoading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: AppColors.primary,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Google "G" logo using coloured segments
                  _GoogleLogo(size: 20),
                  const SizedBox(width: 10),
                  const Text(
                    'Continue with Google',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

class _GoogleLogo extends StatelessWidget {
  final double size;

  const _GoogleLogo({required this.size});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _GoogleLogoPainter()),
    );
  }
}

class _GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // Draw coloured arcs to mimic the Google logo
    final segments = [
      (0.0, 0.5 * 3.14159, const Color(0xFF4285F4)), // blue – top-right + right
      (
        0.5 * 3.14159,
        0.5 * 3.14159,
        const Color(0xFF34A853),
      ), // green – bottom-right
      (
        1.0 * 3.14159,
        0.5 * 3.14159,
        const Color(0xFFFBBC05),
      ), // yellow – bottom-left
      (1.5 * 3.14159, 0.5 * 3.14159, const Color(0xFFEA4335)), // red – top-left
    ];

    for (final (start, sweep, color) in segments) {
      final paint = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = size.width * 0.18
        ..strokeCap = StrokeCap.butt;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius * 0.72),
        start,
        sweep,
        false,
        paint,
      );
    }

    // White horizontal bar for the "G" notch
    final barPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = size.width * 0.18
      ..strokeCap = StrokeCap.square;

    canvas.drawLine(
      Offset(size.width * 0.5, size.height * 0.5),
      Offset(size.width * 0.95, size.height * 0.5),
      barPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
