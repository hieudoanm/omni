import Foundation

/// How a section lays out its sub-sections.
///
/// The menu-bar panel is a narrow popover, so it shows one sub-section at a time
/// behind a segmented picker. The dashboard window has the width to show them
/// side by side, so it drops the picker entirely.
enum ContentLayout {
    case panel
    case window
}
