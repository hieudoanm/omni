# 00 — Overview

Product vision and scope for Omni.

## Vision

Omni is a lightweight native macOS menu-bar utility for monitoring **RAM usage** and **disk storage usage** at a glance.

> **How much memory and storage am I using right now?**

## Focus

The first version focuses exclusively on:

- RAM usage
- Disk/storage usage
- Percentage used
- Used / total values
- Compact progress indicators
- Menu-bar presentation
- Lightweight resource consumption

## Platform

- macOS only
- Native Apple Silicon support
- Intel support optional

## UI Technology

Use Swift, SwiftUI, AppKit where necessary for macOS menu-bar integration.

Do **not** use Tauri, Electron, React, WebView, JavaScript, or Node.js runtime.

## Minimum macOS

macOS 13 Ventura

## Principles

| Principle | Meaning |
| --------- | ------- |
| Native first | SwiftUI, AppKit, SF Symbols, system colours |
| Minimal | Every element earns its place |
| Fast | Popover opens instantly |
| Quiet | No bounce, glow, or attention-seeking motion |
| Accurate | Unknown state says so; never render `0 GB` for a failed read |
| Resource-conscious | ~0% idle CPU, <50 MB memory |

## Supporting files

See `00-overview/` for the product one-pager and scope diagram.
