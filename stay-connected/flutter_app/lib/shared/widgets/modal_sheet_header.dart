import 'package:flutter/material.dart';

class ModalSheetHeader extends StatelessWidget {
  final String title;
  final VoidCallback onDone;
  const ModalSheetHeader({super.key, required this.title, required this.onDone});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ),
          SizedBox(
            width: 44,
            height: 44,
            child: TextButton(onPressed: onDone, child: const Text('Done')),
          ),
        ],
      ),
    );
  }
}
