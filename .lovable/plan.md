
# Features Page Redesign

## Problems Identified

1. **Missing features** -- The sidebar has these modules not shown on the Features page:
   - CRA Shield (Consumer Rights Act decision engine)
   - Handovers (vehicle handover packs)
   - Tasks (task management with due dates)
   - Documents (document library and generation)
   - Staff KPIs and My KPIs (performance tracking)
   - Team Management (staff accounts and roles)
   - Audit Log (full activity trail)
   - Dashboard (overview with stats)
   - Dealer AI Chat (AI assistant)

2. **Too much vertical whitespace** -- Large padding between sections (py-20, py-24, py-28) creates excessive scrolling on desktop

3. **No product visuals** -- Every section is text-only cards with icons; no screenshots or mockups to show what the product actually looks like

## Plan

### 1. Reduce spacing throughout
- Cut section padding from `py-20`/`py-24` to `py-12`/`py-16`
- Reduce margins between headings and content
- Tighten the hero section padding

### 2. Add placeholder images for each category section
Each category section will get a side-by-side layout: features on one side, a placeholder image on the other (alternating left/right). The placeholder will be a styled container with a dashed border, a camera icon, and text like "Product screenshot -- CRM Dashboard" so you know exactly which screenshot to generate later.

Layout per section:
```text
+---------------------------+-------------------+
| Feature cards (left)      | [Placeholder img] |
+---------------------------+-------------------+

Next section flips:
+-------------------+---------------------------+
| [Placeholder img] | Feature cards (right)     |
+-------------------+---------------------------+
```

### 3. Add the missing features to the categories

Reorganise into 5 categories instead of 3:

- **Sales and CRM**: Leads Pipeline, Sale Invoices, Vehicle Data Checks, Handovers
- **Aftersales and Legal**: Aftersales and Complaints, CRA Shield, Warranties
- **Operations**: Courtesy Cars, Tasks, Documents, Review Booster
- **Reporting and Team**: Dashboard, Reports and KPIs, Staff KPIs, Team Management
- **Compliance and Admin**: Compliance Centre, Audit Log, Dealer AI Chat, Support Tickets

### 4. Add a hero placeholder image
Below the hero text, add a wide placeholder for a dashboard overview screenshot.

### 5. Keep the core modules section (3 cards) but add a placeholder below each card for a feature screenshot.

## Technical Details

### File changes
- `src/pages/Features.tsx` -- Full rewrite of the categories data and layout:
  - Update `categories` array to 5 groups with all missing features added
  - Change section layout from single-column cards to a 2-column grid (features + placeholder image)
  - Reduce all `py-*` values
  - Add `ImagePlaceholder` component (inline) -- a rounded div with dashed border, muted icon, and label text
  - Add hero image placeholder below the hero subtitle
  - Add icons imports for new features (ShieldAlert, PackageCheck, Target, FolderOpen, TrendingUp, UsersRound, ScrollText, LayoutDashboard, Bot)
