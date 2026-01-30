'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, Menu } from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
  primary?: boolean;
}

interface MobileNavProps {
  links: NavLink[];
}

export default function MobileNav({ links }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus close button when menu opens
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle keyboard navigation (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Simple focus trap
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const focusableElements = menuRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        type="button"
        className="lg:hidden p-2 text-gray-700 hover:text-primary-600 transition focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        style={{ 
          position: 'relative', 
          zIndex: 50,
          WebkitTapHighlightColor: 'rgba(0,0,0,0)',
        }}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay - only renders when open */}
      {isOpen && (
        <div
          onClick={closeMenu}
          className="lg:hidden"
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998,
          }}
        />
      )}

      {/* Slide-out Menu */}
      <div
        ref={menuRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!isOpen}
        className="lg:hidden bg-white shadow-2xl overflow-y-auto"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '280px',
          maxWidth: '80vw',
          zIndex: 9999,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms ease-in-out',
        }}
      >
        {/* Close Button Header */}
        <div className="flex items-center justify-end p-6 border-b bg-white sticky top-0" style={{ zIndex: 10 }}>
          <button
            ref={closeButtonRef}
            onClick={closeMenu}
            className="p-2 text-gray-700 hover:text-primary-600 transition focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            aria-label="Close menu"
            style={{ 
              minHeight: '44px', 
              minWidth: '44px',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-6" aria-label="Mobile navigation">
          <ul className="space-y-4">
            {links.map((link, index) => (
              <li key={index}>
                {link.primary ? (
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className="btn btn-primary w-full text-center block focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                    style={{ minHeight: '44px' }}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className="block py-3 px-4 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition focus-visible:ring-2 focus-visible:ring-primary-500"
                    style={{ minHeight: '44px' }}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
