import React from 'react';
import renderer from 'react-test-renderer';
import SelectableChip from '@/components/buttons/SelectableChip';
import { ThemeProvider } from '@/theme';

describe('SelectableChip', () => {
  it('renders default (unselected) state', () => {
    const tree = renderer.create(
      <ThemeProvider mode="light">
        <SelectableChip label="Calendar" selected={false} onToggle={() => {}} />
      </ThemeProvider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders selected state (check visible)', () => {
    const tree = renderer.create(
      <ThemeProvider mode="light">
        <SelectableChip label="Calendar" selected onToggle={() => {}} />
      </ThemeProvider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
