import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import '../../features/plan/presentation/plan_history_screen.dart';
import '../../features/plan/presentation/plan_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        name: 'home',
        builder: (context, state) => const _HomeScreen(),
      ),
      GoRoute(
        path: '/plan',
        name: 'plan',
        builder: (context, state) => const PlanScreen(),
      ),
      GoRoute(
        path: '/history',
        name: 'history',
        builder: (context, state) => const PlanHistoryScreen(),
      ),
    ],
  );
});

class _HomeScreen extends StatelessWidget {
  const _HomeScreen();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Stay Connected')),
      body: Center(
        child: Wrap(
          spacing: 12,
          children: [
            ElevatedButton(
              onPressed: () => context.go('/plan'),
              child: const Text('Plan'),
            ),
            ElevatedButton(
              onPressed: () => context.go('/history'),
              child: const Text('History'),
            ),
          ],
        ),
      ),
    );
  }
}
