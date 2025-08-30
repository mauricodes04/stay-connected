import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class DateWheel extends StatefulWidget {
  final DateTime initial;
  final ValueChanged<DateTime> onChanged;
  const DateWheel({super.key, required this.initial, required this.onChanged});

  @override
  State<DateWheel> createState() => _DateWheelState();
}

class _DateWheelState extends State<DateWheel> {
  late int year;
  late int month;
  late int day;

  @override
  void initState() {
    super.initState();
    year = widget.initial.year;
    month = widget.initial.month;
    day = widget.initial.day;
  }

  void _notify() {
    widget.onChanged(DateTime(year, month, day));
  }

  @override
  Widget build(BuildContext context) {
    final years = List.generate(50, (i) => DateTime.now().year - 25 + i);
    final months = List.generate(12, (i) => i + 1);
    final days = List.generate(31, (i) => i + 1);

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: CupertinoPicker(
            itemExtent: 36,
            scrollController: FixedExtentScrollController(initialItem: month - 1),
            onSelectedItemChanged: (i) {
              setState(() => month = months[i]);
              _notify();
            },
            children: months
                .map((m) => Center(child: Text(DateFormat.MMM().format(DateTime(0, m)))))
                .toList(),
          ),
        ),
        Expanded(
          child: CupertinoPicker(
            itemExtent: 36,
            scrollController: FixedExtentScrollController(initialItem: day - 1),
            onSelectedItemChanged: (i) {
              setState(() => day = days[i]);
              _notify();
            },
            children: days.map((d) => Center(child: Text(d.toString()))).toList(),
          ),
        ),
        Expanded(
          child: Padding(
            padding: MediaQuery.of(context).padding.copyWith(left: 0),
            child: CupertinoPicker(
              itemExtent: 36,
              scrollController: FixedExtentScrollController(initialItem: years.indexOf(year)),
              onSelectedItemChanged: (i) {
                setState(() => year = years[i]);
                _notify();
              },
              children: years.map((y) => Align(alignment: Alignment.centerRight, child: Text('$y'))).toList(),
            ),
          ),
        ),
      ],
    );
  }
}
