import 'package:flex_color_scheme/flex_color_scheme.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:flutter/material.dart';

final appThemeProvider = Provider<AppTheme>((ref) => AppTheme());

class AppTheme {
  ThemeData get light => FlexThemeData.light(scheme: FlexScheme.indigo).copyWith(
        visualDensity: VisualDensity.adaptivePlatformDensity,
      );
  ThemeData get dark => FlexThemeData.dark(scheme: FlexScheme.indigo).copyWith(
        visualDensity: VisualDensity.adaptivePlatformDensity,
      );
}
