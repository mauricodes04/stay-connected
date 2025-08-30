# Changelog

## [Unreleased]

### Added
- Plan History: swipe right-to-left to reveal Delete; tap deletes with animated row collapse.
- Confirm Plan: selectable integrations (Calendar, Text, ICS) with animated label→✓ and persistent selection until create.

### Changed
- Selector sheets (person, date, time, duration): replaced header close “X” with right-aligned “Done” button. Removed duplicate inline Done controls.
- Confirm Plan layout: action buttons moved above the final “+ Create Plan” button.

### Notes
- Date/year wheel alignment: project uses `@react-native-community/datetimepicker` spinner/calendar; no custom wheel columns exist. Layout remains responsive and respects safe areas. If custom wheel is introduced later, apply right-edge alignment to the year column per spec.
- Time picker centering: time selection uses a grid in a ModalSheet; content is centered and consistent across devices.
