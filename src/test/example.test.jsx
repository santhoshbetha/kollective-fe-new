// Placeholder example — replace with a real component/utility test.
// Run: npm test
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

function Hello() {
    return <h1>Hello Kollective</h1>;
}

describe('Hello', () => {
    it('renders its text', () => {
        render(<Hello />);
        expect(screen.getByText('Hello Kollective')).toBeInTheDocument();
    });
});