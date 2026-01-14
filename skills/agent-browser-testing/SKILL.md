---
name: agent-browser-testing
description: Specialized skill for automated browser testing using the agent-browser CLI. This skill should be used when users want to automate end-to-end testing, create test scripts for web applications, validate UI flows, capture screenshots, or perform automated browser interactions for QA purposes.
---

# Agent Browser Testing

Specialized expertise for automated browser testing using the `agent-browser` CLI tool from Vercel Labs. This skill enables comprehensive end-to-end testing, UI validation, and automated browser interactions designed specifically for AI-driven testing workflows.

## When to Use This Skill

Activate this skill when working on:

- Automating end-to-end (E2E) testing for web applications
- Creating test scripts for UI validation and regression testing
- Capturing screenshots for visual testing or documentation
- Validating user flows (login, checkout, form submissions)
- Testing responsive design across different viewports
- Performing accessibility testing via accessibility tree snapshots
- Automating repetitive browser-based QA tasks
- Debugging frontend issues with automated reproduction steps

## Prerequisites

### Installation

The agent-browser CLI must be installed globally:

```bash
# Install globally via npm
npm install -g agent-browser

# Download Chromium browser
agent-browser install

# On Linux, include system dependencies
agent-browser install --with-deps
```

### Verify Installation

```bash
# Check that agent-browser is available
agent-browser --version
```

## Core Commands Reference

### Navigation

| Command | Description |
|---------|-------------|
| `agent-browser open <url>` | Navigate to a webpage |
| `agent-browser close` | Shut down the browser |
| `agent-browser screenshot [path]` | Capture visible area (add `--full` for entire page) |
| `agent-browser snapshot` | Get accessibility tree with refs (best for AI testing) |

### Interaction

| Command | Description |
|---------|-------------|
| `agent-browser click <selector>` | Click an element |
| `agent-browser fill <selector> <text>` | Clear and fill an input field |
| `agent-browser type <selector> <text>` | Append text to input |
| `agent-browser press <key>` | Trigger keyboard event (Enter, Tab, Escape, etc.) |
| `agent-browser select <selector> <value>` | Choose dropdown option |

### Information Retrieval

| Command | Description |
|---------|-------------|
| `agent-browser get text <selector>` | Extract text content from element |
| `agent-browser get attr <selector> <attr>` | Get HTML attribute value |
| `agent-browser snapshot` | Get accessibility tree (preferred for element discovery) |

### Smart Element Location

The CLI supports semantic locators for robust element targeting:

```bash
# Find by role and name
agent-browser find role button click --name "Submit"
agent-browser find role textbox fill "user@example.com" --name "Email"

# Find by label
agent-browser find label "Email" fill "user@example.com"
agent-browser find label "Password" fill "secret123"
```

### Session Management

```bash
# Run commands in isolated sessions
agent-browser open "https://example.com" --session test1
agent-browser click "#login" --session test1

# Multiple concurrent sessions
agent-browser open "https://app.com/admin" --session admin
agent-browser open "https://app.com/user" --session user
```

## Testing Workflows

### 1. Basic Page Validation

To verify a page loads correctly and contains expected content:

```bash
# Open the target page
agent-browser open "https://example.com"

# Take a screenshot for visual verification
agent-browser screenshot "screenshots/homepage.png"

# Get accessibility snapshot for content verification
agent-browser snapshot

# Verify specific text content
agent-browser get text "h1"
agent-browser get text ".hero-description"

# Close when done
agent-browser close
```

### 2. Form Submission Testing

To test form workflows:

```bash
# Navigate to form
agent-browser open "https://app.com/signup"

# Fill form fields using semantic locators
agent-browser find label "Email" fill "test@example.com"
agent-browser find label "Password" fill "SecurePass123!"
agent-browser find label "Confirm Password" fill "SecurePass123!"

# Submit form
agent-browser find role button click --name "Create Account"

# Wait for navigation/response
agent-browser snapshot

# Capture result
agent-browser screenshot "screenshots/signup-result.png"

# Verify success message
agent-browser get text ".success-message"
```

### 3. Authentication Flow Testing

To validate login/logout flows:

```bash
# Test login flow
agent-browser open "https://app.com/login"
agent-browser fill "#email" "user@example.com"
agent-browser fill "#password" "password123"
agent-browser click "button[type='submit']"

# Verify authenticated state
agent-browser snapshot
agent-browser screenshot "screenshots/authenticated.png"

# Test logout
agent-browser click "[data-testid='user-menu']"
agent-browser click "[data-testid='logout-button']"

# Verify logged out
agent-browser snapshot
agent-browser get text "h1"
```

### 4. Navigation Testing

To verify navigation links and routing:

```bash
# Start from homepage
agent-browser open "https://app.com"

# Test navigation links
agent-browser click "a[href='/about']"
agent-browser screenshot "screenshots/about-page.png"

# Use browser back
agent-browser navigate back

# Verify we're back on homepage
agent-browser snapshot

# Test another route
agent-browser click "a[href='/contact']"
agent-browser get text "h1"
```

### 5. Responsive Design Testing

To validate layouts across viewports:

```bash
# Desktop viewport
agent-browser open "https://app.com"
agent-browser resize 1920 1080
agent-browser screenshot "screenshots/desktop.png"

# Tablet viewport
agent-browser resize 768 1024
agent-browser screenshot "screenshots/tablet.png"

# Mobile viewport
agent-browser resize 375 667
agent-browser screenshot "screenshots/mobile.png"

# Verify mobile menu appears
agent-browser snapshot
agent-browser click "[data-testid='mobile-menu-toggle']"
```

### 6. Error State Testing

To validate error handling:

```bash
# Test invalid form submission
agent-browser open "https://app.com/login"
agent-browser fill "#email" "invalid-email"
agent-browser fill "#password" ""
agent-browser click "button[type='submit']"

# Capture error states
agent-browser snapshot
agent-browser screenshot "screenshots/validation-errors.png"

# Verify error messages
agent-browser get text ".error-message"
agent-browser get text "[aria-invalid='true'] + .field-error"
```

### 7. Accessibility Tree Testing

The accessibility tree snapshot is the preferred method for AI-driven testing:

```bash
# Get full accessibility tree
agent-browser snapshot

# The snapshot returns structured data with:
# - Element roles (button, textbox, link, etc.)
# - Accessible names
# - States (focused, disabled, expanded, etc.)
# - Reference IDs for interaction
```

Use accessibility snapshots to:
- Discover interactive elements without knowing CSS selectors
- Verify ARIA labels and roles
- Test screen reader compatibility
- Find elements by semantic meaning

## Test Script Patterns

### Creating Reusable Test Scripts

To create a bash test script:

```bash
#!/bin/bash
# test-login-flow.sh

set -e  # Exit on error

echo "Testing login flow..."

# Setup
agent-browser open "https://app.com/login"

# Execute test
agent-browser fill "#email" "$TEST_EMAIL"
agent-browser fill "#password" "$TEST_PASSWORD"
agent-browser click "button[type='submit']"

# Verify
HEADING_TEXT=$(agent-browser get text "h1")
if [[ "$HEADING_TEXT" == *"Welcome"* ]]; then
    echo "PASS: Login successful"
    agent-browser screenshot "screenshots/login-success.png"
else
    echo "FAIL: Expected Welcome, got: $HEADING_TEXT"
    agent-browser screenshot "screenshots/login-failure.png"
    exit 1
fi

# Cleanup
agent-browser close
echo "Test complete!"
```

### Multi-Step Test Orchestration

For complex test suites, chain commands with error handling:

```bash
#!/bin/bash
# run-test-suite.sh

PASSED=0
FAILED=0

run_test() {
    local test_name=$1
    local test_script=$2

    echo "Running: $test_name"
    if bash "$test_script"; then
        ((PASSED++))
        echo "PASS: $test_name"
    else
        ((FAILED++))
        echo "FAIL: $test_name"
    fi
}

# Run test suite
run_test "Login Flow" "tests/test-login.sh"
run_test "Signup Flow" "tests/test-signup.sh"
run_test "Main Navigation" "tests/test-navigation.sh"

# Report results
echo "========================"
echo "Results: $PASSED passed, $FAILED failed"
exit $FAILED
```

## Best Practices

### 1. Prefer Semantic Locators

Use accessibility-based selectors over brittle CSS selectors:

```bash
# Good - semantic, robust
agent-browser find role button click --name "Submit"
agent-browser find label "Email" fill "user@example.com"

# Acceptable - data attributes designed for testing
agent-browser click "[data-testid='submit-button']"

# Avoid - brittle, breaks easily
agent-browser click ".btn.btn-primary.submit-form"
agent-browser click "div > form > button:nth-child(3)"
```

### 2. Use Accessibility Snapshots for Discovery

When unsure of element selectors:

```bash
# Get the accessibility tree first
agent-browser snapshot

# Review the output to find:
# - Element roles and names
# - Interactive elements
# - Form field labels
# Then use semantic locators based on findings
```

### 3. Capture Screenshots at Key Steps

Document test progress visually:

```bash
# Before action
agent-browser screenshot "screenshots/step1-before.png"

# Perform action
agent-browser click "#submit"

# After action
agent-browser screenshot "screenshots/step1-after.png"
```

### 4. Handle Dynamic Content

For pages with loading states or async content:

```bash
# Wait for specific element to appear
agent-browser wait "[data-testid='content-loaded']"

# Or use snapshot to verify content loaded
agent-browser snapshot | grep "Expected Content"
```

### 5. Isolate Tests with Sessions

Prevent test interference:

```bash
# Each test gets its own session
agent-browser open "https://app.com" --session test-1
agent-browser open "https://app.com" --session test-2

# Sessions have separate cookies, storage, etc.
```

### 6. Clean Up After Tests

Always close the browser:

```bash
# In test scripts, use trap for cleanup
trap "agent-browser close" EXIT

# Or explicitly close
agent-browser close
```

## Application-Specific Testing Examples

When testing specific application flows, adapt these patterns to your app:

### Task/Item Creation Flow

```bash
agent-browser open "http://localhost:3000/tasks"
agent-browser find role button click --name "New Task"
agent-browser find label "Title" fill "Test Task"
agent-browser find label "Description" fill "Test description"
agent-browser find role button click --name "Create"
agent-browser snapshot
agent-browser screenshot "screenshots/task-created.png"
```

### User Account Display

```bash
agent-browser open "http://localhost:3000/account"
agent-browser snapshot  # Verify account info display
agent-browser get text "[data-testid='user-name']"
agent-browser get text "[data-testid='user-email']"
```

### Home Page Testing

```bash
agent-browser open "http://localhost:3000"
agent-browser snapshot
agent-browser screenshot "screenshots/home-loaded.png" --full
```

## Troubleshooting

### Browser Not Starting

```bash
# Reinstall browser
agent-browser install --with-deps

# Check for existing processes
pkill -f chromium
agent-browser close
```

### Element Not Found

```bash
# Use snapshot to see available elements
agent-browser snapshot

# Check if element is in iframe
agent-browser frame list
agent-browser frame switch "iframe-name"
```

### Slow Tests

```bash
# Add explicit waits only when needed
agent-browser wait "[data-loaded='true']" --timeout 10000

# Use headless mode (default) for faster execution
```

## Resources

### Scripts

- `scripts/run-e2e-tests.sh` - Comprehensive E2E test runner
- `scripts/visual-regression.sh` - Screenshot comparison testing

### References

- `references/command-reference.md` - Complete command documentation
- `references/selector-patterns.md` - CSS and semantic selector examples

## Quick Reference

```bash
# Essential commands
agent-browser open <url>           # Navigate
agent-browser snapshot             # Get accessibility tree
agent-browser click <selector>     # Click element
agent-browser fill <selector> <text>  # Fill input
agent-browser screenshot [path]    # Capture screen
agent-browser close                # Shutdown browser

# Semantic finding
agent-browser find role <role> <action> --name "<name>"
agent-browser find label "<label>" <action>

# Sessions
agent-browser <command> --session <name>
```
