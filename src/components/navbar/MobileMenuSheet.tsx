'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { MobileMenuPanel } from './MobileMenuPanel';
import type { MobileMenuPanelProps } from './MobileMenuPanel';

type MobileMenuSheetProps = MobileMenuPanelProps & {open: boolean;};

export function MobileMenuSheet({ open, ...panelProps }: MobileMenuSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const content =
  <AnimatePresence>{open && <MobileMenuPanel key="mobile-sheet" {...panelProps} />}</AnimatePresence>;

  if (panelProps.contained) return content;
  // Portals require document.body, which does not exist during prerendering.
  return mounted ? createPortal(content, document.body) : null;
}