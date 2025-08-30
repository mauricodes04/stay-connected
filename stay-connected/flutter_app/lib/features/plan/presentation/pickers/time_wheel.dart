import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class TimeWheel extends StatefulWidget {
  final TimeOfDay initial;
  final ValueChanged<TimeOfDay> onChanged;
  const TimeWheel({super.key, required this.initial, required this.onChanged});

  @override
  State<TimeWheel> createState() => _TimeWheelState();
}

class _TimeWheelState extends State<TimeWheel> {
  late int hour; // 1-12
  late int minute; // 0-59
  late String period; // AM/PM

  @override
  void initState() {
    super.initState();
    hour = widget.initial.hourOfPeriod == 0 ? 12 : widget.initial.hourOfPeriod;
    minute = widget.initial.minute;
    period = widget.initial.period == DayPeriod.am ? 'AM' : 'PM';
  }

  void _notify() {
    final h24 = period == 'AM' ? (hour % 12) : (hour % 12 + 12);
    widget.onChanged(TimeOfDay(hour: h24, minute: minute));
  }

  @override
  Widget build(BuildContext context) {
    final hours = List.generate(12, (i) => (i + 1));
    final minutes = List.generate(60, (i) => i);
    final periods = const ['AM', 'PM'];

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Expanded(
          child: CupertinoPicker(
            itemExtent: 36,
            scrollController: FixedExtentScrollController(initialItem: hours.indexOf(hour)),
            onSelectedItemChanged: (i) {
              setState(() => hour = hours[i]);
              _notify();
            },
            children: hours.map((h) => Center(child: Text(h.toString().padLeft(2, '0')))).toList(),
          ),
        ),
        Expanded(
          child: CupertinoPicker(
            itemExtent: 36,
            scrollController: FixedExtentScrollController(initialItem: minute),
            onSelectedItemChanged: (i) {
              setState(() => minute = minutes[i]);
              _notify();
            },
            children: minutes.map((m) => Center(child: Text(m.toString().padLeft(2, '0')))).toList(),
          ),
        ),
        Expanded(
          child: CupertinoPicker(
            itemExtent: 36,
            scrollController: FixedExtentScrollController(initialItem: periods.indexOf(period)),
            onSelectedItemChanged: (i) {
              setState(() => period = periods[i]);
              _notify();
            },
            children: periods.map((p) => Center(child: Text(p))).toList(),
          ),
        ),
      ],
    );
  }
}
