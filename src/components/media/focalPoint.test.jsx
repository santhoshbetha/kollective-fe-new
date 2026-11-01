import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { FocalPointSelector } from './FocalPointSelector';
import { PostMediaGrid, getObjectPosition } from '../posts/PostMediaGrid';

describe('Mastodon Focal Point Alignment System', () => {
    describe('getObjectPosition coordinate conversion', () => {
        it('calculates center position (0, 0) as 50% 50%', () => {
            expect(getObjectPosition(0, 0)).toBe('50% 50%');
        });

        it('calculates top-right quadrant (0.5, 0.5) as 75% 25%', () => {
            expect(getObjectPosition(0.5, 0.5)).toBe('75% 25%');
        });

        it('calculates bottom-left quadrant (-1, -1) as 0% 100%', () => {
            expect(getObjectPosition(-1, -1)).toBe('0% 100%');
        });

        it('calculates top-right corner (1, 1) as 100% 0%', () => {
            expect(getObjectPosition(1, 1)).toBe('100% 0%');
        });
    });

    describe('FocalPointSelector Component', () => {
        it('renders crosshair element and coordinate indicator', () => {
            render(
                <FocalPointSelector
                    imageUrl="https://example.com/test.jpg"
                    focalX={0.5}
                    focalY={0.5}
                />
            );

            const selector = screen.getByTestId('focal-point-selector');
            expect(selector).toBeInTheDocument();
            expect(selector.className).toContain('cursor-crosshair');
            expect(screen.getByText(/X:\s*\+?0\.50\s*\|\s*Y:\s*\+?0\.50/i)).toBeInTheDocument();
        });

        it('triggers onChange with converted Mastodon float coordinates on pointer down', () => {
            const handleChange = vi.fn();
            render(
                <FocalPointSelector
                    imageUrl="https://example.com/test.jpg"
                    onChange={handleChange}
                />
            );

            const selector = screen.getByTestId('focal-point-selector');

            // Mock getBoundingClientRect
            vi.spyOn(selector, 'getBoundingClientRect').mockReturnValue({
                left: 0,
                top: 0,
                width: 200,
                height: 100,
                right: 200,
                bottom: 100,
                x: 0,
                y: 0,
                toJSON: () => {}
            });

            // Pointer down at (150, 25) which is 75% width, 25% height
            fireEvent.pointerDown(selector, {
                clientX: 150,
                clientY: 25,
                pointerId: 1
            });

            expect(handleChange).toHaveBeenCalledWith({
                x: 0.5,
                y: 0.5
            });
        });

        it('tracks the reticle continuously while dragging the pointer', () => {
            const handleChange = vi.fn();
            render(
                <FocalPointSelector
                    imageUrl="https://example.com/test.jpg"
                    onChange={handleChange}
                />
            );

            const selector = screen.getByTestId('focal-point-selector');

            vi.spyOn(selector, 'getBoundingClientRect').mockReturnValue({
                left: 0,
                top: 0,
                width: 200,
                height: 100,
                right: 200,
                bottom: 100,
                x: 0,
                y: 0,
                toJSON: () => {}
            });

            fireEvent.pointerDown(selector, { clientX: 50, clientY: 50, pointerId: 1 });
            fireEvent.pointerMove(selector, { clientX: 150, clientY: 25, pointerId: 1 });

            expect(handleChange).toHaveBeenLastCalledWith({
                x: 0.5,
                y: 0.5
            });
        });
    });

    describe('PostMediaGrid Component', () => {
        it('applies objectPosition computed from focal_x and focal_y', () => {
            const attachments = [
                {
                    id: 'att-1',
                    url: 'https://example.com/image.jpg',
                    focal_x: 0.5,
                    focal_y: 0.5
                }
            ];

            render(<PostMediaGrid mediaAttachments={attachments} />);
            const img = screen.getByRole('img');
            expect(img).toHaveStyle({ objectPosition: '75% 25%' });
        });
    });
});

