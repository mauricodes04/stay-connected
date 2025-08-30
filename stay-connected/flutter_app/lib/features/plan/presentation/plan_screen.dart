import 'package:flutter/material.dart';
import 'package:modal_bottom_sheet/modal_bottom_sheet.dart';
import 'pickers/date_wheel.dart';
import 'pickers/time_wheel.dart';
import '../../../shared/widgets/modal_sheet_header.dart';

class PlanScreen extends StatefulWidget {
  const PlanScreen({super.key});

  @override
  State<PlanScreen> createState() => _PlanScreenState();
}

class _PlanScreenState extends State<PlanScreen> {
  DateTime date = DateTime.now();
  TimeOfDay time = TimeOfDay.now();

  Future<void> _openDatePicker() async {
    await showCupertinoModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ModalSheetHeader(title: 'Select Date', onDone: () => Navigator.pop(context)),
            SizedBox(height: 250, child: DateWheel(initial: date, onChanged: (d) => setState(() => date = d))),
          ],
        ),
      ),
    );
  }

  Future<void> _openTimePicker() async {
    await showCupertinoModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ModalSheetHeader(title: 'Select Time', onDone: () => Navigator.pop(context)),
            SizedBox(height: 250, child: TimeWheel(initial: time, onChanged: (t) => setState(() => time = t))),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Plan')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Date: ${date.toLocal().toString().split(' ').first}')
                ,
            const SizedBox(height: 8),
            ElevatedButton(onPressed: _openDatePicker, child: const Text('Pick Date')),
            const SizedBox(height: 24),
            Text('Time: ${time.format(context)}'),
            const SizedBox(height: 8),
            ElevatedButton(onPressed: _openTimePicker, child: const Text('Pick Time')),
          ],
        ),
      ),
    );
  }
}
