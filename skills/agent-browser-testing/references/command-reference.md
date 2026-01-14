# Agent Browser Command Reference

Complete reference for all `agent-browser` CLI commands.

## Navigation Commands

### open

Navigate to a URL.

```bash
agent-browser open <url> [options]
```

**Options:**
- `--session <name>` - Use a named session for isolation
- `--wait-until <event>` - Wait until: load, domcontentloaded, networkidle

**Examples:**
```bash
agent-browser open "https://example.com"
agent-browser open "http://localhost:3000" --session test1
agent-browser open "https://app.com" --wait-until networkidle
```

### close

Shut down the browser.

```bash
agent-browser close [options]
```

**Options:**
- `--session <name>` - Close a specific session

**Examples:**
```bash
agent-browser close
agent-browser close --session test1
```

### navigate

Navigate forward or back.

```bash
agent-browser navigate <direction>
```

**Direction:**
- `back` - Go back in history
- `forward` - Go forward in history

**Examples:**
```bash
agent-browser navigate back
agent-browser navigate forward
```

## Interaction Commands

### click

Click an element.

```bash
agent-browser click <selector> [options]
```

**Options:**
- `--session <name>` - Target a specific session
- `--force` - Force click even if element is obscured

**Examples:**
```bash
agent-browser click "#submit-button"
agent-browser click "[data-testid='login']"
agent-browser click "button.primary" --force
```

### fill

Clear and fill an input field.

```bash
agent-browser fill <selector> <text> [options]
```

**Examples:**
```bash
agent-browser fill "#email" "user@example.com"
agent-browser fill "[name='password']" "secret123"
```

### type

Append text to an input (doesn't clear first).

```bash
agent-browser type <selector> <text> [options]
```

**Examples:**
```bash
agent-browser type "#search" "additional text"
```

### press

Press a keyboard key.

```bash
agent-browser press <key> [options]
```

**Common keys:**
- `Enter`, `Tab`, `Escape`, `Backspace`, `Delete`
- `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`
- `Home`, `End`, `PageUp`, `PageDown`
- `F1` through `F12`

**Modifiers:**
- `Control+a`, `Shift+Tab`, `Meta+c` (Cmd on Mac)

**Examples:**
```bash
agent-browser press Enter
agent-browser press Tab
agent-browser press "Control+a"
agent-browser press Escape
```

### select

Select an option from a dropdown.

```bash
agent-browser select <selector> <value> [options]
```

**Examples:**
```bash
agent-browser select "#country" "US"
agent-browser select "[name='timezone']" "America/New_York"
```

### hover

Hover over an element.

```bash
agent-browser hover <selector> [options]
```

**Examples:**
```bash
agent-browser hover "#dropdown-trigger"
agent-browser hover "[data-testid='tooltip-target']"
```

### scroll

Scroll to an element or position.

```bash
agent-browser scroll <selector|direction> [options]
```

**Examples:**
```bash
agent-browser scroll "#footer"
agent-browser scroll "down"
agent-browser scroll "up"
```

## Information Commands

### get

Get information from elements.

```bash
agent-browser get <property> <selector> [options]
```

**Properties:**
- `text` - Get text content
- `attr <name>` - Get attribute value
- `value` - Get input value

**Examples:**
```bash
agent-browser get text "h1"
agent-browser get text ".error-message"
agent-browser get attr "#link" "href"
agent-browser get value "#email-input"
```

### snapshot

Get accessibility tree (best for AI testing).

```bash
agent-browser snapshot [options]
```

**Options:**
- `--session <name>` - Target a specific session

**Output format:**
The snapshot returns a structured accessibility tree showing:
- Element roles (button, textbox, link, heading, etc.)
- Accessible names
- States (focused, disabled, expanded, checked, etc.)
- Reference IDs for interaction

**Examples:**
```bash
agent-browser snapshot
agent-browser snapshot --session test1

# Pipe to grep for specific elements
agent-browser snapshot | grep "button"
agent-browser snapshot | grep -i "email"
```

### screenshot

Capture a screenshot.

```bash
agent-browser screenshot [path] [options]
```

**Options:**
- `--full` - Capture full page (not just viewport)
- `--session <name>` - Target a specific session

**Examples:**
```bash
agent-browser screenshot
agent-browser screenshot "screenshots/login.png"
agent-browser screenshot "full-page.png" --full
```

## Semantic Finding Commands

### find role

Find elements by accessibility role.

```bash
agent-browser find role <role> <action> [options]
```

**Common roles:**
- `button`, `link`, `textbox`, `checkbox`, `radio`
- `combobox`, `listbox`, `option`
- `heading`, `img`, `table`, `row`, `cell`
- `dialog`, `alert`, `menu`, `menuitem`
- `tab`, `tabpanel`, `tree`, `treeitem`

**Options:**
- `--name <name>` - Match accessible name

**Examples:**
```bash
# Click buttons by name
agent-browser find role button click --name "Submit"
agent-browser find role button click --name "Cancel"

# Fill textboxes by name
agent-browser find role textbox fill "user@email.com" --name "Email"

# Select from combobox
agent-browser find role combobox click --name "Country"
```

### find label

Find form elements by their label.

```bash
agent-browser find label "<label-text>" <action>
```

**Examples:**
```bash
agent-browser find label "Email" fill "user@example.com"
agent-browser find label "Password" fill "secret123"
agent-browser find label "Remember me" click
```

### find text

Find elements by text content.

```bash
agent-browser find text "<text>" <action>
```

**Examples:**
```bash
agent-browser find text "Learn more" click
agent-browser find text "Sign up" click
```

## Session Commands

### Session isolation

Each session has its own:
- Cookies and storage
- Authentication state
- Browser history
- Open tabs

**Examples:**
```bash
# Create isolated sessions
agent-browser open "https://app.com" --session admin
agent-browser open "https://app.com" --session user

# Interact with specific session
agent-browser fill "#email" "admin@test.com" --session admin
agent-browser fill "#email" "user@test.com" --session user

# Close specific session
agent-browser close --session admin
```

## Frame Commands

### frame list

List all frames in the page.

```bash
agent-browser frame list
```

### frame switch

Switch to a frame for subsequent commands.

```bash
agent-browser frame switch <name|index>
```

**Examples:**
```bash
agent-browser frame list
agent-browser frame switch "iframe-payment"
agent-browser fill "#card-number" "4111111111111111"
agent-browser frame switch "main"  # Switch back
```

## Wait Commands

### wait

Wait for an element or condition.

```bash
agent-browser wait <selector> [options]
```

**Options:**
- `--timeout <ms>` - Maximum wait time (default: 30000)
- `--state <state>` - Wait for: visible, hidden, attached, detached

**Examples:**
```bash
agent-browser wait "[data-loaded='true']"
agent-browser wait "#modal" --state visible
agent-browser wait ".spinner" --state hidden
agent-browser wait "#content" --timeout 10000
```

## Viewport Commands

### resize

Resize the browser viewport.

```bash
agent-browser resize <width> <height>
```

**Common viewports:**
- Desktop: 1920x1080, 1440x900, 1366x768
- Tablet: 768x1024, 1024x768
- Mobile: 375x667 (iPhone), 414x896 (iPhone Plus), 360x640 (Android)

**Examples:**
```bash
agent-browser resize 1920 1080
agent-browser resize 375 667
agent-browser resize 768 1024
```

## Network Commands

### network

Intercept and mock network requests.

```bash
agent-browser network <action> [options]
```

**Actions:**
- `block <pattern>` - Block matching requests
- `mock <pattern> <response>` - Mock matching requests
- `clear` - Clear all network rules

**Examples:**
```bash
# Block analytics
agent-browser network block "**/analytics/**"

# Mock API response
agent-browser network mock "**/api/user" '{"name": "Test User"}'

# Clear rules
agent-browser network clear
```

## Cookie Commands

### cookie

Manage cookies.

```bash
agent-browser cookie <action> [options]
```

**Actions:**
- `list` - List all cookies
- `set <name> <value>` - Set a cookie
- `delete <name>` - Delete a cookie
- `clear` - Clear all cookies

**Examples:**
```bash
agent-browser cookie list
agent-browser cookie set "session" "abc123"
agent-browser cookie delete "tracking"
agent-browser cookie clear
```

## Device Emulation

### emulate

Emulate a device.

```bash
agent-browser emulate <device>
```

**Common devices:**
- `iPhone 12`, `iPhone 13`, `iPhone 14`
- `iPad`, `iPad Pro`
- `Pixel 5`, `Galaxy S21`

**Examples:**
```bash
agent-browser emulate "iPhone 12"
agent-browser emulate "iPad Pro"
agent-browser emulate "Pixel 5"
```

## Output and Debugging

### console

Get console messages.

```bash
agent-browser console [options]
```

**Examples:**
```bash
# View all console output
agent-browser console

# Filter by type
agent-browser console --type error
agent-browser console --type warning
```

### evaluate

Execute JavaScript in the page.

```bash
agent-browser evaluate "<script>"
```

**Examples:**
```bash
agent-browser evaluate "document.title"
agent-browser evaluate "window.scrollY"
agent-browser evaluate "localStorage.getItem('token')"
```

## Exit Codes

- `0` - Success
- `1` - Command failed
- `2` - Element not found
- `3` - Timeout
- `4` - Browser not running

## Environment Variables

- `AGENT_BROWSER_HEADLESS` - Run in headless mode (default: true)
- `AGENT_BROWSER_TIMEOUT` - Default timeout in ms (default: 30000)
- `AGENT_BROWSER_SLOW_MO` - Slow down operations by ms (default: 0)
