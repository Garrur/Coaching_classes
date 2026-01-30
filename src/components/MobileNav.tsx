'use client';

import { useState, useEffect } from 'react';
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

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        type="button"
        className="lg:hidden p-2 text-gray-700 hover:text-primary-600 transition"
        aria-label="Toggle menu"
        style={{ 
          position: 'relative', 
          zIndex: 50,
          WebkitTapHighlightColor: 'rgba(0,0,0,0)',
          MozUserSelect: 'none',
          WebkitUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none',
          outline: '0',
          outlineWidth: '0',
          outlineStyle: 'none',
          outlineColor: 'transparent',
          border: '0',
          borderStyle: 'none',
          boxShadow: 'none',
          background: 'transparent',
          backgroundColor: 'transparent',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
        }}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay - only renders when open */}
      {isOpen && (
        <div
          onClick={closeMenu}
          className="lg:hidden"
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

      {/* Slide-out Menu - always rendered but translated */}
      <div
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
            onClick={closeMenu}
            className="p-2 text-gray-700 hover:text-primary-600 transition focus:outline-none"
            aria-label="Close menu"
            style={{ 
              minHeight: '44px', 
              minWidth: '44px',
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-6">
          <ul className="space-y-4">
            {links.map((link, index) => (
              <li key={index}>
                {link.primary ? (
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className="btn btn-primary w-full text-center block"
                    style={{ minHeight: '44px' }}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className="block py-3 px-4 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition"
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
