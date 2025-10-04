import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders chatbot application', () => {
  const { container } = render(<App />);
  const appElement = container.querySelector('.flex.h-screen');
  expect(appElement).toBeInTheDocument();
});