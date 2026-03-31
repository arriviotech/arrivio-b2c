import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Landing from '../Landing';

// Mock components used in Landing
vi.mock('../../components/landing/HeroSection', () => ({
    default: () => <div data-testid="hero-section">Hero Section</div>
}));
vi.mock('../../components/landing/VisionSection', () => ({
    default: () => <div data-testid="vision-section">Vision Section</div>
}));
vi.mock('../../components/landing/CommunityBanner', () => ({
    default: () => <div data-testid="community-banner">Community Banner</div>
}));
vi.mock('../../components/landing/JourneySection', () => ({
    default: () => <div data-testid="journey-section">Journey Section</div>
}));
vi.mock('../../components/landing/WhoWeServeSection', () => ({
    default: () => <div data-testid="who-we-serve">Who We Serve</div>
}));
vi.mock('../../components/landing/PricingTiersSection', () => ({
    default: () => <div data-testid="pricing-tiers">Pricing Tiers</div>
}));
vi.mock('../../components/landing/TestimonialsSection', () => ({
    default: () => <div data-testid="testimonials">Testimonials</div>
}));
vi.mock('../../components/landing/FAQSection', () => ({
    default: () => <div data-testid="faq-section">FAQ</div>
}));
vi.mock('../../components/landing/LocationsSection', () => ({
    default: () => <div data-testid="locations-section">Locations</div>
}));

describe('Landing Page', () => {
    it('renders all sections correctly', () => {
        render(
            <BrowserRouter>
                <Landing />
            </BrowserRouter>
        );

        expect(screen.getByTestId('hero-section')).toBeInTheDocument();
        expect(screen.getByTestId('vision-section')).toBeInTheDocument();
        expect(screen.getByTestId('community-banner')).toBeInTheDocument();
        expect(screen.getByTestId('journey-section')).toBeInTheDocument();
        expect(screen.getByTestId('who-we-serve')).toBeInTheDocument();
        expect(screen.getByTestId('pricing-tiers')).toBeInTheDocument();
        expect(screen.getByTestId('testimonials')).toBeInTheDocument();
        expect(screen.getByTestId('faq-section')).toBeInTheDocument();
        expect(screen.getByTestId('locations-section')).toBeInTheDocument();
    });
});
