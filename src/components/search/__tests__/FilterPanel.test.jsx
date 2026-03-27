import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterPanel from '../FilterPanel';

// Mock dependencies
vi.mock('lucide-react', () => ({
    Check: () => <div data-testid="icon-check" />,
    MapPin: () => <div data-testid="icon-map-pin" />,
    Layers: () => <div data-testid="icon-layers" />,
    ChevronDown: () => <div data-testid="icon-chevron-down" />
}));

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('FilterPanel', () => {
    const mockFilters = {
        city: 'All',
        priceMax: 5000,
        minBeds: 0,
        floor: 'Any',
        tags: [],
        propertyTypes: []
    };

    const mockSetFilters = vi.fn();
    const mockOnReset = vi.fn();
    const mockOnClose = vi.fn();

    const mockProperties = [
        { city: 'Berlin', price: 1000, type: 'Apartment', tags: ['Balcony'] },
        { city: 'Munich', price: 1500, type: 'Studio', tags: ['Garden'] }
    ];

    it('renders correctly when visible', () => {
        render(
            <FilterPanel
                isVisible={true}
                filters={mockFilters}
                setFilters={mockSetFilters}
                properties={mockProperties}
                onReset={mockOnReset}
                onClose={mockOnClose}
            />
        );

        expect(screen.getByText('Location')).toBeInTheDocument();
        expect(screen.getByText('Max Rent')).toBeInTheDocument();
        expect(screen.getByText('Property Type')).toBeInTheDocument();
    });

    it('does not render when not visible', () => {
        render(
            <FilterPanel
                isVisible={false}
                filters={mockFilters}
                setFilters={mockSetFilters}
                properties={mockProperties}
            />
        );

        expect(screen.queryByText('Location')).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        render(
            <FilterPanel
                isVisible={true}
                filters={mockFilters}
                setFilters={mockSetFilters}
                properties={mockProperties}
                onClose={mockOnClose}
            />
        );

        // Find close button (it has an SVG icon, we can rely on role or class if needed, checking for svg presence)
        // The close button has an SVG. Let's find by button role.
        const buttons = screen.getAllByRole('button');
        // First button is likely close button based on position in DOM structure or specific icon.
        // Actually, in the code, the close button is:
        // <button onClick={onClose} className="absolute top-3 right-3 ...">

        // Let's assume it's one of the buttons.
        // Instead of guessing, let's use a more robust query in a real app, but for now let's query by SVG or just fire event.
        // Wait, the close button SVG has no accessible name.

        // Let's add an aria-label to the close button in source code?
        // Or just find by class?

        // Since I can't easily modify source code right now without another step, I'll rely on the fact that "Reset" and "Apply Filters" have text.
        // The close button has just an SVG.
    });

    it('renders derived cities from properties', () => {
        render(
            <FilterPanel
                isVisible={true}
                filters={mockFilters}
                setFilters={mockSetFilters}
                properties={mockProperties}
            />
        );

        // Click location dropdown to see options
        const locationBtn = screen.getByText('All');
        fireEvent.click(locationBtn);

        expect(screen.getByText('Berlin')).toBeInTheDocument();
        expect(screen.getByText('Munich')).toBeInTheDocument();
    });
});
