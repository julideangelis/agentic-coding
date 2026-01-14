# Selector Patterns Reference

Best practices and patterns for selecting elements with agent-browser.

## Selector Priority (Best to Worst)

1. **Semantic locators** - Most robust, based on accessibility
2. **data-testid attributes** - Designed for testing, stable
3. **Accessible names** - Role + name combinations
4. **Semantic HTML** - Tags with meaning (button, input, etc.)
5. **ID selectors** - Unique but may change
6. **Class selectors** - Often styling-based, fragile
7. **Complex CSS paths** - Very fragile, avoid

## Semantic Locators (Preferred)

### By Role and Name

```bash
# Buttons
agent-browser find role button click --name "Submit"
agent-browser find role button click --name "Cancel"
agent-browser find role button click --name "Add to Cart"

# Links
agent-browser find role link click --name "Learn more"
agent-browser find role link click --name "Sign up"

# Form inputs
agent-browser find role textbox fill "value" --name "Email"
agent-browser find role textbox fill "value" --name "Search"

# Checkboxes and radios
agent-browser find role checkbox click --name "Remember me"
agent-browser find role radio click --name "Credit Card"

# Dropdowns
agent-browser find role combobox click --name "Country"
agent-browser find role listbox click --name "Options"
```

### By Label

```bash
# Form fields by their visible labels
agent-browser find label "Email Address" fill "user@example.com"
agent-browser find label "Password" fill "secret123"
agent-browser find label "Phone Number" fill "+1234567890"
agent-browser find label "Agree to Terms" click
```

### By Text Content

```bash
# Any element by its text
agent-browser find text "Get Started" click
agent-browser find text "Read More" click
agent-browser find text "View Details" click
```

## Data Test ID Selectors

The second-best option when semantic locators aren't available.

```bash
# Elements with data-testid attribute
agent-browser click "[data-testid='login-button']"
agent-browser fill "[data-testid='email-input']" "user@example.com"
agent-browser click "[data-testid='submit-form']"

# Alternative attributes
agent-browser click "[data-test='login']"
agent-browser click "[data-cy='submit']"  # Cypress convention
agent-browser click "[data-qa='button']"
```

## CSS Selectors

### ID Selectors

```bash
# By ID (unique on page)
agent-browser click "#submit-button"
agent-browser fill "#email" "user@example.com"
agent-browser click "#main-nav"
```

### Type Selectors

```bash
# By HTML element type
agent-browser click "button"  # First button
agent-browser fill "input[type='email']" "user@example.com"
agent-browser click "a[href='/login']"
```

### Attribute Selectors

```bash
# Exact match
agent-browser click "[name='submit']"
agent-browser fill "[placeholder='Enter email']" "user@example.com"
agent-browser click "[type='submit']"

# Contains
agent-browser click "[class*='primary']"  # Class contains 'primary'
agent-browser click "[href*='/login']"     # Href contains '/login'

# Starts with
agent-browser click "[class^='btn-']"      # Class starts with 'btn-'

# Ends with
agent-browser click "[href$='.pdf']"       # Href ends with '.pdf'
```

### Combinators

```bash
# Descendant (any level)
agent-browser click "form button"          # Button inside form
agent-browser click "#header a"            # Link inside #header

# Child (direct)
agent-browser click "nav > ul > li"        # Direct child

# Adjacent sibling
agent-browser click "label + input"        # Input immediately after label

# General sibling
agent-browser click "h2 ~ p"               # Paragraphs after h2
```

### Pseudo-selectors

```bash
# Position
agent-browser click "li:first-child"
agent-browser click "li:last-child"
agent-browser click "li:nth-child(2)"
agent-browser click "li:nth-child(odd)"

# State
agent-browser click "button:not([disabled])"
agent-browser click "input:checked"
agent-browser click "option:selected"

# Content
agent-browser click "button:has-text('Submit')"
```

## Common Patterns by Element Type

### Forms

```bash
# Text inputs
agent-browser fill "input[type='text']" "value"
agent-browser fill "input[name='username']" "value"
agent-browser find label "Username" fill "value"

# Password
agent-browser fill "input[type='password']" "secret"
agent-browser find label "Password" fill "secret"

# Email
agent-browser fill "input[type='email']" "user@example.com"

# Textarea
agent-browser fill "textarea" "Multi-line\ntext content"
agent-browser fill "textarea[name='message']" "Content"

# Submit button
agent-browser click "button[type='submit']"
agent-browser click "input[type='submit']"
agent-browser find role button click --name "Submit"

# Checkboxes
agent-browser click "input[type='checkbox']"
agent-browser click "#terms-checkbox"
agent-browser find role checkbox click --name "Accept Terms"

# Radio buttons
agent-browser click "input[type='radio'][value='option1']"
agent-browser find role radio click --name "Option 1"

# Select dropdowns
agent-browser select "select[name='country']" "US"
agent-browser find role combobox click --name "Country"
```

### Navigation

```bash
# Links
agent-browser click "a[href='/about']"
agent-browser click "nav a:has-text('About')"
agent-browser find role link click --name "About"

# Menu items
agent-browser click "[role='menuitem']:has-text('Settings')"
agent-browser find role menuitem click --name "Settings"

# Tabs
agent-browser click "[role='tab']:has-text('Settings')"
agent-browser find role tab click --name "Settings"
```

### Buttons and Actions

```bash
# Primary actions
agent-browser click "button.primary"
agent-browser click "[data-testid='primary-action']"
agent-browser find role button click --name "Save"

# Secondary actions
agent-browser click "button.secondary"
agent-browser find role button click --name "Cancel"

# Icon buttons
agent-browser click "[aria-label='Close']"
agent-browser click "button:has(svg.close-icon)"

# Disabled handling
agent-browser click "button:not([disabled])"
```

### Modals and Dialogs

```bash
# Open modal
agent-browser click "[data-testid='open-modal']"

# Modal content
agent-browser click "[role='dialog'] button"
agent-browser find role dialog

# Close modal
agent-browser click "[aria-label='Close modal']"
agent-browser press Escape
```

### Tables

```bash
# Table cells
agent-browser get text "table tbody tr:first-child td:first-child"
agent-browser click "table tbody tr:nth-child(2) button"

# By header content
agent-browser click "tr:has(td:has-text('John'))"
```

## Application-Specific Patterns

Adapt these patterns to your specific application's UI components.

### Task/Item Management

```bash
# Create task button
agent-browser find role button click --name "New Task"
agent-browser click "[data-testid='create-task']"

# Task form fields
agent-browser find label "Title" fill "My Task"
agent-browser find label "Description" fill "Task description"

# Task type selection
agent-browser find role radio click --name "Daily"
agent-browser find role radio click --name "Weekly"

# Task list items
agent-browser click "[data-testid='task-item']:has-text('Task Name')"
```

### User Account Info

```bash
# Account info display
agent-browser get text "[data-testid='user-name']"
agent-browser get text "[data-testid='user-email']"
agent-browser get text "[data-testid='user-role']"
```

### Main Page Elements

```bash
# Main container
agent-browser click "[data-testid='main-container']"

# Page controls
agent-browser click "[data-testid='refresh-button']"
agent-browser click "[data-testid='settings-button']"
```

## Anti-Patterns (Avoid These)

### Overly Specific Paths

```bash
# BAD - Breaks easily
agent-browser click "div.container > div.row > div.col-md-6 > form > div.form-group:nth-child(3) > button"

# GOOD - Semantic
agent-browser find role button click --name "Submit"
```

### Styling-Based Selectors

```bash
# BAD - Tied to CSS
agent-browser click ".btn-primary-lg-rounded"

# GOOD - Test ID
agent-browser click "[data-testid='submit-button']"
```

### Index-Based Selection

```bash
# BAD - Fragile ordering
agent-browser click "button:nth-child(3)"

# GOOD - Explicit targeting
agent-browser find role button click --name "Save"
```

### Generic Selectors

```bash
# BAD - Too generic
agent-browser click "button"

# GOOD - Specific
agent-browser find role button click --name "Login"
```

## Debugging Selectors

When a selector doesn't work:

```bash
# 1. Get the accessibility snapshot
agent-browser snapshot

# 2. Search for the element
agent-browser snapshot | grep -i "button"
agent-browser snapshot | grep -i "submit"

# 3. Find the exact name/role
# Then use semantic locator based on findings
agent-browser find role button click --name "Exact Name Here"
```

## Selector Validation Tips

1. **Test in isolation** - Verify selector matches exactly one element
2. **Use snapshot first** - Discover elements via accessibility tree
3. **Prefer specificity over complexity** - Simple, targeted selectors
4. **Add data-testid in code** - When semantic options aren't available
5. **Document custom patterns** - Keep team-specific patterns consistent
