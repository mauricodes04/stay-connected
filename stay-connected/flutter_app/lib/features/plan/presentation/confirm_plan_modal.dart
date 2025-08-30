import 'package:flutter/material.dart';
import '../../shared/widgets/selectable_chip.dart';

class ConfirmPlanModal extends StatefulWidget {
  const ConfirmPlanModal({super.key});

  @override
  State<ConfirmPlanModal> createState() => _ConfirmPlanModalState();
}

class _ConfirmPlanModalState extends State<ConfirmPlanModal> {
  bool calendar = false;
  bool text = false;
  bool ics = false;
  bool creating = false;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Wrap(
            spacing: 8,
            children: [
              SelectableChip(label: 'Calendar', selected: calendar, onTap: () => setState(() => calendar = !calendar)),
              SelectableChip(label: 'Text', selected: text, onTap: () => setState(() => text = !text)),
              SelectableChip(label: 'ICS', selected: ics, onTap: () => setState(() => ics = !ics)),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: creating
                  ? null
                  : () async {
                      setState(() => creating = true);
                      await Future.delayed(const Duration(milliseconds: 500));
                      if (mounted) setState(() => creating = false);
                      if (mounted) Navigator.pop(context);
                    },
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 250),
                child: creating
                    ? const Icon(Icons.check, key: ValueKey('check'))
                    : const Text('Create Plan', key: ValueKey('label')),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
