#!/bin/bash
#
# Visual Regression Testing Script using agent-browser
#
# Captures screenshots of specified pages and compares them against baselines.
# Uses ImageMagick for image comparison.
#
# Usage:
#   ./visual-regression.sh capture    # Capture baseline screenshots
#   ./visual-regression.sh compare    # Compare current screenshots against baseline
#   ./visual-regression.sh update     # Update baselines with current screenshots
#
# Environment variables:
#   BASE_URL          - Base URL for the application (default: http://localhost:3000)
#   BASELINE_DIR      - Directory for baseline screenshots (default: ./visual-baselines)
#   CURRENT_DIR       - Directory for current screenshots (default: ./visual-current)
#   DIFF_DIR          - Directory for diff images (default: ./visual-diffs)
#   THRESHOLD         - Allowed pixel difference percentage (default: 0.1)
#

set -e

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
BASELINE_DIR="${BASELINE_DIR:-./visual-baselines}"
CURRENT_DIR="${CURRENT_DIR:-./visual-current}"
DIFF_DIR="${DIFF_DIR:-./visual-diffs}"
THRESHOLD="${THRESHOLD:-0.1}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Pages to capture (path:name:viewport)
PAGES=(
    "/:homepage:1920x1080"
    "/:homepage-mobile:375x667"
    "/:homepage-tablet:768x1024"
    "/login:login:1920x1080"
    "/login:login-mobile:375x667"
)

# Cleanup on exit
cleanup() {
    agent-browser close 2>/dev/null || true
}
trap cleanup EXIT

# Capture screenshot for a specific page
capture_page() {
    local path="$1"
    local name="$2"
    local viewport="$3"
    local output_dir="$4"

    local width height
    IFS='x' read -r width height <<< "$viewport"

    echo -e "${BLUE}Capturing: $name ($viewport)${NC}"

    agent-browser open "${BASE_URL}${path}"
    agent-browser resize "$width" "$height"

    # Wait for content to load
    sleep 1

    agent-browser screenshot "$output_dir/${name}.png" --full
}

# Capture all pages
capture_all() {
    local output_dir="$1"

    mkdir -p "$output_dir"

    for page_spec in "${PAGES[@]}"; do
        IFS=':' read -r path name viewport <<< "$page_spec"
        capture_page "$path" "$name" "$viewport" "$output_dir"
    done

    echo -e "\n${GREEN}Screenshots captured to: $output_dir${NC}"
}

# Compare two images
compare_images() {
    local baseline="$1"
    local current="$2"
    local diff_output="$3"
    local name="$4"

    # Check if ImageMagick is available
    if ! command -v compare &> /dev/null; then
        echo -e "${YELLOW}Warning: ImageMagick not installed. Using basic comparison.${NC}"

        # Fallback to checksum comparison
        local baseline_hash current_hash
        baseline_hash=$(md5sum "$baseline" | cut -d' ' -f1)
        current_hash=$(md5sum "$current" | cut -d' ' -f1)

        if [[ "$baseline_hash" == "$current_hash" ]]; then
            echo -e "${GREEN}MATCH: $name${NC}"
            return 0
        else
            echo -e "${RED}DIFF: $name (files differ)${NC}"
            return 1
        fi
    fi

    # Use ImageMagick compare
    local result
    result=$(compare -metric AE "$baseline" "$current" "$diff_output" 2>&1 || true)

    # Get percentage difference
    local baseline_pixels current_pixels diff_percent
    baseline_pixels=$(identify -format "%[fx:w*h]" "$baseline")
    diff_percent=$(echo "scale=4; $result / $baseline_pixels * 100" | bc)

    if (( $(echo "$diff_percent <= $THRESHOLD" | bc -l) )); then
        echo -e "${GREEN}MATCH: $name (${diff_percent}% diff)${NC}"
        return 0
    else
        echo -e "${RED}DIFF: $name (${diff_percent}% diff - threshold: ${THRESHOLD}%)${NC}"
        return 1
    fi
}

# Compare all captured images against baselines
compare_all() {
    mkdir -p "$CURRENT_DIR"
    mkdir -p "$DIFF_DIR"

    # First, capture current screenshots
    echo -e "${BLUE}Capturing current screenshots...${NC}\n"
    capture_all "$CURRENT_DIR"

    echo -e "\n${BLUE}Comparing against baselines...${NC}\n"

    local passed=0
    local failed=0
    local missing=0

    for page_spec in "${PAGES[@]}"; do
        IFS=':' read -r path name viewport <<< "$page_spec"

        local baseline="$BASELINE_DIR/${name}.png"
        local current="$CURRENT_DIR/${name}.png"
        local diff="$DIFF_DIR/${name}-diff.png"

        if [[ ! -f "$baseline" ]]; then
            echo -e "${YELLOW}MISSING BASELINE: $name${NC}"
            ((missing++))
            continue
        fi

        if compare_images "$baseline" "$current" "$diff" "$name"; then
            ((passed++))
        else
            ((failed++))
        fi
    done

    echo ""
    echo "========================================"
    echo "Visual Regression Results"
    echo "========================================"
    echo -e "${GREEN}Passed: $passed${NC}"
    echo -e "${RED}Failed: $failed${NC}"
    if [[ $missing -gt 0 ]]; then
        echo -e "${YELLOW}Missing baselines: $missing${NC}"
    fi
    echo "========================================"

    if [[ $failed -gt 0 ]]; then
        echo -e "\n${RED}Visual regressions detected!${NC}"
        echo "Check diff images in: $DIFF_DIR"
        return 1
    fi

    if [[ $missing -gt 0 ]]; then
        echo -e "\n${YELLOW}Some baselines are missing.${NC}"
        echo "Run '$0 capture' to create baselines."
        return 1
    fi

    echo -e "\n${GREEN}All visual tests passed!${NC}"
    return 0
}

# Update baselines with current screenshots
update_baselines() {
    echo -e "${YELLOW}Updating baselines...${NC}\n"

    capture_all "$BASELINE_DIR"

    echo -e "\n${GREEN}Baselines updated in: $BASELINE_DIR${NC}"
    echo "Remember to commit these changes!"
}

# Main
main() {
    local command="${1:-compare}"

    # Check if agent-browser is available
    if ! command -v agent-browser &> /dev/null; then
        echo -e "${RED}Error: agent-browser CLI not found${NC}"
        echo "Install with: npm install -g agent-browser && agent-browser install"
        exit 1
    fi

    case "$command" in
        capture)
            echo "========================================"
            echo "Capturing Baseline Screenshots"
            echo "========================================"
            echo "Base URL: $BASE_URL"
            echo "Output: $BASELINE_DIR"
            echo "========================================"
            capture_all "$BASELINE_DIR"
            ;;
        compare)
            echo "========================================"
            echo "Visual Regression Testing"
            echo "========================================"
            echo "Base URL: $BASE_URL"
            echo "Threshold: ${THRESHOLD}%"
            echo "========================================"
            compare_all
            ;;
        update)
            update_baselines
            ;;
        *)
            echo "Usage: $0 {capture|compare|update}"
            echo ""
            echo "Commands:"
            echo "  capture  - Capture baseline screenshots"
            echo "  compare  - Compare current state against baselines"
            echo "  update   - Update baselines with current screenshots"
            exit 1
            ;;
    esac
}

main "$@"
