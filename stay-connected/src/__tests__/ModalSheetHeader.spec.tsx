import React from 'react';
import renderer from 'react-test-renderer';
import ModalSheetHeader from '@/components/ModalSheetHeader';
import { ThemeProvider } from '@/theme';

describe('ModalSheetHeader', () => {
  it('renders with title and Done button', () => {
    const tree = renderer.create(
      <ThemeProvider mode="light">
        <ModalSheetHeader title="Select Something" onDone={() => {}} />
      </ThemeProvider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders with subtitle', () => {
    const tree = renderer.create(
      <ThemeProvider mode="light">
        <ModalSheetHeader title="Select" subtitle="Optional hint" onDone={() => {}} />
      </ThemeProvider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
