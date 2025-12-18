# Navigation Button States - Visual Reference

## Guest User View (Not Authenticated)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  🍽️ Eathub     Menu     🛒 Cart     [👤+ Sign Up]  [→ Login]   │
│                                      ▔▔▔▔▔▔▔▔▔▔▔   ▔▔▔▔▔▔▔▔     │
│                                      Purple         Purple       │
│                                      Gradient       Border       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Button Details:
- **Sign Up**: Solid purple gradient, white text, user-plus icon
- **Login**: Transparent with purple border, white text, arrow icon

## Authenticated User View

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  🍽️ Eathub     Menu     🛒 Cart     [⚙️ Settings]              │
│                                      ▔▔▔▔▔▔▔▔▔▔▔                │
│                                      Green                       │
│                                      Gradient                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Button Details:
- **Settings**: Solid green gradient, white text, gear icon

## Mobile View (Hamburger Menu)

### Guest User - Mobile Menu Open
```
┌─────────────────────────┐
│  🍽️ Eathub        ☰    │
├─────────────────────────┤
│                         │
│  Menu                   │
│                         │
│  🛒 Cart                │
│                         │
│  ┌───────────────────┐  │
│  │ 👤+ Sign Up       │  │ ← Purple gradient
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ → Login           │  │ ← Purple border
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

### Authenticated User - Mobile Menu Open
```
┌─────────────────────────┐
│  🍽️ Eathub        ☰    │
├─────────────────────────┤
│                         │
│  Menu                   │
│                         │
│  🛒 Cart                │
│                         │
│  ┌───────────────────┐  │
│  │ ⚙️ Settings       │  │ ← Green gradient
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

## Button Hover States

### Sign Up Button
```
Normal:     [👤+ Sign Up]  ← Purple gradient
Hover:      [👤+ Sign Up]  ← Lifted 2px, purple shadow
            ▔▔▔▔▔▔▔▔▔▔▔
```

### Login Button
```
Normal:     [→ Login]      ← Transparent, purple border
Hover:      [→ Login]      ← Light purple bg, lifted 2px
            ▔▔▔▔▔▔▔▔
```

### Settings Button
```
Normal:     [⚙️ Settings]  ← Green gradient
Hover:      [⚙️ Settings]  ← Lifted 2px, green shadow
            ▔▔▔▔▔▔▔▔▔▔▔
```

## Color Specifications

### Sign Up Button
- **Background**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Text**: `#FFFFFF`
- **Border**: `2px solid transparent`
- **Hover Shadow**: `rgba(102, 126, 234, 0.4)`

### Login Button
- **Background**: `transparent`
- **Text**: `#FFFFFF`
- **Border**: `2px solid #667eea`
- **Hover Background**: `rgba(102, 126, 234, 0.1)`
- **Hover Border**: `#764ba2`

### Settings Button
- **Background**: `linear-gradient(135deg, #28a745 0%, #20c997 100%)`
- **Text**: `#FFFFFF`
- **Border**: `2px solid transparent`
- **Hover Shadow**: `rgba(40, 167, 69, 0.4)`

## Icon Specifications

All icons are 18x18px SVG with 2px stroke width:

### Sign Up Icon (User Plus)
```svg
<svg width="18" height="18" viewBox="0 0 24 24">
  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
  <circle cx="8.5" cy="7" r="4"/>
  <line x1="20" y1="8" x2="20" y2="14"/>
  <line x1="23" y1="11" x2="17" y2="11"/>
</svg>
```

### Login Icon (Arrow Right)
```svg
<svg width="18" height="18" viewBox="0 0 24 24">
  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
  <polyline points="10 17 15 12 10 7"/>
  <line x1="15" y1="12" x2="3" y2="12"/>
</svg>
```

### Settings Icon (Gear)
```svg
<svg width="18" height="18" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="3"/>
  <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m0-6l4.2-4.2"/>
</svg>
```

## Spacing & Sizing

### Desktop
- **Button Height**: Auto (min 44px with padding)
- **Button Padding**: `8px 16px`
- **Gap Between Buttons**: `12px`
- **Font Size**: `15px`
- **Font Weight**: `600`
- **Border Radius**: `8px`

### Mobile
- **Button Height**: Auto (min 44px with padding)
- **Button Padding**: `12px 16px`
- **Gap Between Buttons**: `12px` (vertical)
- **Button Width**: `100%`
- **Font Size**: `15px`
- **Font Weight**: `600`
- **Border Radius**: `8px`

## Animation Timing

All buttons use the same transition:
```css
transition: all 0.3s ease;
```

Hover effects:
- **Transform**: `translateY(-2px)` (lifts button up)
- **Shadow**: Appears with 15px blur
- **Duration**: 0.3 seconds
- **Easing**: ease

## State Transitions

### Guest → Authenticated
1. User clicks Sign Up or Login
2. Completes authentication
3. Navigation re-renders
4. Sign Up + Login buttons fade out
5. Settings button fades in
6. Smooth transition (handled by React)

### Authenticated → Guest
1. User clicks Logout in Settings
2. Auth state changes
3. Navigation re-renders
4. Settings button fades out
5. Sign Up + Login buttons fade in
6. Smooth transition (handled by React)

## Accessibility Labels

All buttons have proper semantic HTML:
- `<Link>` elements (not `<button>`) for navigation
- Descriptive text visible to screen readers
- Icons are decorative (aria-hidden could be added)
- Proper focus states
- Keyboard navigable

## Browser DevTools Inspection

To inspect buttons in browser:
1. Right-click on button
2. Select "Inspect Element"
3. Look for classes:
   - `.nav-button` (base)
   - `.signup-button` (Sign Up)
   - `.login-button` (Login)
   - `.settings-button` (Settings)
