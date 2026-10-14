import React from 'react';
import { PageIntro } from '../components/PageIntro';
import { Navbar } from '../components/navbar/Navbar';
import { ScaledFrame } from '../components/spec/ScaledFrame';
import { PageSkeleton } from '../components/spec/PageSkeleton';
import { SectionHeading } from '../components/spec/SectionHeading';
import { StateMatrix } from '../components/spec/StateMatrix';
import { navbarStateRows } from '../components/spec/navbarStateRows';

export function NavbarSpec() {
  return (
    <>
      <PageIntro
        title="Navbar"
        lede="The floating navigation for Pristaine. The live version is at the top of this page. Below are fixed-width previews you can interact with, and every control in each state." />
      

      <section aria-labelledby="desktop-heading" className="px-4 pb-16 md:pb-24 lg:px-6">
        <div className="mx-auto flex max-w-content flex-col gap-8">
          <SectionHeading
            id="desktop-heading"
            title="Desktop, 1280px"
            description="Hover or focus the chevron to open Services after 150ms. The panel stays open while the pointer moves into it, and Escape or an outside click closes it." />
          
          <ScaledFrame width={1280} height={112} label="Default, with About as the current page">
            <Navbar layout="desktop" contained currentPath="/about" label="Desktop preview" />
          </ScaledFrame>
          <ScaledFrame width={1280} height={420} label="Services dropdown open, with Services as the current page">
            <PageSkeleton />
            <Navbar
              layout="desktop"
              contained
              defaultDropdownOpen
              currentPath="/services"
              label="Desktop preview, services open" />
            
          </ScaledFrame>
        </div>
      </section>

      <section aria-labelledby="mobile-heading" className="px-4 pb-16 md:pb-24 lg:px-6">
        <div className="mx-auto flex max-w-content flex-col gap-8">
          <SectionHeading
            id="mobile-heading"
            title="Mobile, 360px"
            description="Below 768px the links move into a full-screen menu. Below 360px the compact button is hidden and Book a Consultation becomes the first menu item." />
          
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <ScaledFrame width={360} height={640} label="360px, closed">
              <PageSkeleton />
              <Navbar layout="mobile" contained label="Mobile preview" />
            </ScaledFrame>
            <ScaledFrame width={360} height={640} label="360px, menu open with Services expanded">
              <Navbar
                layout="mobile"
                contained
                defaultMenuOpen
                defaultServicesExpanded
                currentPath="/services"
                label="Mobile preview, menu open" />
              
            </ScaledFrame>
            <ScaledFrame width={320} height={640} label="320px, closed: compact button hidden">
              <PageSkeleton />
              <Navbar layout="mobile-narrow" contained label="Narrow mobile preview" />
            </ScaledFrame>
            <ScaledFrame width={320} height={640} label="320px, menu open: booking is first">
              <Navbar
                layout="mobile-narrow"
                contained
                defaultMenuOpen
                currentPath="/about"
                label="Narrow mobile preview, menu open" />
              
            </ScaledFrame>
          </div>
        </div>
      </section>

      <section aria-labelledby="states-heading" className="px-4 pb-16 md:pb-24 lg:px-6">
        <div className="mx-auto flex max-w-content flex-col gap-8">
          <SectionHeading
            id="states-heading"
            title="Control states"
            description="Focus is a 2px aqua ring with a 2px offset. Hover and focus take 150ms, and the dropdown and accordion take 250ms. With reduced motion turned on, the static version is shown." />
          
          <StateMatrix rows={navbarStateRows} label="Navbar control states" />
        </div>
      </section>
    </>);

}