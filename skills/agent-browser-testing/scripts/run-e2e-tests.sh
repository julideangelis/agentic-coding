#!/bin/bash
#
# Comprehensive E2E Test Runner using agent-browser
#
# Usage:
#   ./run-e2e-tests.sh                    # Run all tests
#   ./run-e2e-tests.sh --test login       # Run specific test
#   ./run-e2e-tests.sh --base-url http://localhost:3001  # Custom base URL
#
# Environment variables:
#   BASE_URL          - Base URL for the application (default: http://localhost:3000)
#   SCREENSHOT_DIR    - Directory for screenshots (default: ./screenshots)
#   TEST_TIMEOUT      - Timeout for each test in seconds (default: 30)
#

set -e

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
SCREENSHOT_DIR="${SCREENSHOT_DIR:-./screenshots}"
TEST_TIMEOUT="${TEST_TIMEOUT:-30}"
SPECIFIC_TEST=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --base-url)
            BASE_URL="$2"
            shift 2
            ;;
        --test)
            SPECIFIC_TEST="$2"
            shift 2
            ;;
        --screenshot-dir)
            SCREENSHOT_DIR="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --base-url URL       Base URL for the application"
            echo "  --test NAME          Run only the specified test"
            echo "  --screenshot-dir DIR Directory for screenshots"
            echo "  --help               Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Initialize
mkdir -p "$SCREENSHOT_DIR"

PASSED=0
FAILED=0
SKIPPED=0

# Cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Cleaning up...${NC}"
    agent-browser close 2>/dev/null || true
}
trap cleanup EXIT

# Test runner function
run_test() {
    local test_name="$1"
    local test_function="$2"

    # Skip if specific test requested and doesn't match
    if [[ -n "$SPECIFIC_TEST" && "$test_name" != *"$SPECIFIC_TEST"* ]]; then
        ((SKIPPED++))
        return 0
    fi

    echo -e "\n${YELLOW}Running: $test_name${NC}"

    if timeout "$TEST_TIMEOUT" bash -c "$test_function"; then
        echo -e "${GREEN}PASS: $test_name${NC}"
        ((PASSED++))
    else
        echo -e "${RED}FAIL: $test_name${NC}"
        agent-browser screenshot "$SCREENSHOT_DIR/FAIL-$(echo "$test_name" | tr ' ' '-').png" 2>/dev/null || true
        ((FAILED++))
    fi
}

# =============================================================================
# TEST DEFINITIONS
# =============================================================================

test_homepage_loads() {
    agent-browser open "$BASE_URL"
    agent-browser snapshot | grep -q "button\|link\|heading"
    agent-browser screenshot "$SCREENSHOT_DIR/homepage.png"
}

test_navigation_links() {
    agent-browser open "$BASE_URL"

    # Get snapshot to discover navigation elements
    local snapshot
    snapshot=$(agent-browser snapshot)

    # Verify main navigation exists
    echo "$snapshot" | grep -qi "nav\|menu\|link"

    agent-browser screenshot "$SCREENSHOT_DIR/navigation.png"
}

test_responsive_mobile() {
    agent-browser open "$BASE_URL"
    agent-browser resize 375 667
    agent-browser screenshot "$SCREENSHOT_DIR/mobile-375x667.png"

    # Verify content is still visible
    agent-browser snapshot | grep -q "button\|link\|text"
}

test_responsive_tablet() {
    agent-browser open "$BASE_URL"
    agent-browser resize 768 1024
    agent-browser screenshot "$SCREENSHOT_DIR/tablet-768x1024.png"

    agent-browser snapshot | grep -q "button\|link\|text"
}

test_responsive_desktop() {
    agent-browser open "$BASE_URL"
    agent-browser resize 1920 1080
    agent-browser screenshot "$SCREENSHOT_DIR/desktop-1920x1080.png"

    agent-browser snapshot | grep -q "button\|link\|text"
}

test_accessibility_structure() {
    agent-browser open "$BASE_URL"

    local snapshot
    snapshot=$(agent-browser snapshot)

    # Verify proper heading structure
    echo "$snapshot" | grep -qi "heading\|h1\|h2"

    # Verify interactive elements have roles
    echo "$snapshot" | grep -qi "button\|link"
}

test_login_page_loads() {
    agent-browser open "$BASE_URL/login"

    # Verify login form elements exist
    local snapshot
    snapshot=$(agent-browser snapshot)

    echo "$snapshot" | grep -qi "email\|password\|login\|sign\|textbox"

    agent-browser screenshot "$SCREENSHOT_DIR/login-page.png"
}

test_home_page_loads() {
    agent-browser open "$BASE_URL"

    agent-browser snapshot | grep -qi "button\|heading"
    agent-browser screenshot "$SCREENSHOT_DIR/home-page.png"
}

test_account_page_loads() {
    agent-browser open "$BASE_URL/account"

    # Verify account elements are displayed
    agent-browser snapshot | grep -qi "account\|user\|button\|heading"
    agent-browser screenshot "$SCREENSHOT_DIR/account-page.png"
}

test_404_page() {
    agent-browser open "$BASE_URL/this-page-does-not-exist-12345"

    # Verify 404 or error content
    local snapshot
    snapshot=$(agent-browser snapshot)

    echo "$snapshot" | grep -qi "404\|not found\|error\|home"

    agent-browser screenshot "$SCREENSHOT_DIR/404-page.png"
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

echo "========================================"
echo "E2E Test Suite"
echo "========================================"
echo "Base URL: $BASE_URL"
echo "Screenshots: $SCREENSHOT_DIR"
echo "========================================"

# Check if agent-browser is available
if ! command -v agent-browser &> /dev/null; then
    echo -e "${RED}Error: agent-browser CLI not found${NC}"
    echo "Install with: npm install -g agent-browser && agent-browser install"
    exit 1
fi

# Run tests
run_test "Homepage Loads" test_homepage_loads
run_test "Navigation Links" test_navigation_links
run_test "Responsive Mobile (375x667)" test_responsive_mobile
run_test "Responsive Tablet (768x1024)" test_responsive_tablet
run_test "Responsive Desktop (1920x1080)" test_responsive_desktop
run_test "Accessibility Structure" test_accessibility_structure
run_test "Login Page Loads" test_login_page_loads
run_test "Home Page Loads" test_home_page_loads
run_test "Account Page Loads" test_account_page_loads
run_test "404 Page" test_404_page

# Summary
echo ""
echo "========================================"
echo "Test Results"
echo "========================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
if [[ $SKIPPED -gt 0 ]]; then
    echo -e "${YELLOW}Skipped: $SKIPPED${NC}"
fi
echo "========================================"

# Exit with failure if any tests failed
if [[ $FAILED -gt 0 ]]; then
    echo -e "\n${RED}Some tests failed. Check screenshots in $SCREENSHOT_DIR${NC}"
    exit 1
fi

echo -e "\n${GREEN}All tests passed!${NC}"
exit 0
