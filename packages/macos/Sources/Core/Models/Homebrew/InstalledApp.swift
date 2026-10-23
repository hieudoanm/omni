import Foundation

/// A GUI application installed on the machine, independent of Homebrew.
///
/// Groups apps by their functional category (read from the bundle's
/// `LSApplicationCategoryType` key). When Homebrew installs an app via a
/// cask, the optional cask token links it back to Homebrew for uninstall.
public struct InstalledApp: Identifiable, Hashable, Sendable {
    public let id: String
    public let name: String
    public let path: String
    public let bundleIdentifier: String?
    public let version: String?
    public let category: Category

    /// The Homebrew cask that manages this app, if any.
    public var caskToken: String?

    public init(
        name: String,
        path: String,
        bundleIdentifier: String? = nil,
        version: String? = nil,
        category: Category = .uncategorized,
        caskToken: String? = nil
    ) {
        id = path
        self.name = name
        self.path = path
        self.bundleIdentifier = bundleIdentifier
        self.version = version
        self.category = category
        self.caskToken = caskToken
    }
}

public extension InstalledApp {
    enum Category: String, CaseIterable, Identifiable, Sendable {
        case business = "Business"
        case developerTools = "Developer Tools"
        case education = "Education"
        case entertainment = "Entertainment"
        case finance = "Finance"
        case games = "Games"
        case graphicsDesign = "Graphics & Design"
        case healthcareFitness = "Health & Fitness"
        case lifestyle = "Lifestyle"
        case medical = "Medical"
        case music = "Music"
        case news = "News"
        case photography = "Photography"
        case productivity = "Productivity"
        case reference = "Reference"
        case socialNetworking = "Social Networking"
        case sports = "Sports"
        case travel = "Travel"
        case utilities = "Utilities"
        case video = "Video"
        case weather = "Weather"
        case uncategorized = "Uncategorized"

        public var id: String {
            rawValue
        }

        /// Maps an app's `LSApplicationCategoryType` value to a category.
        /// Unknown or unset values resolve to `nil` (callers use `.uncategorized`).
        init?(lsCategory: String?) {
            guard let value = lsCategory else { return nil }
            switch value {
            case "public.app-category.business": self = .business
            case "public.app-category.developer-tools": self = .developerTools
            case "public.app-category.education": self = .education
            case "public.app-category.entertainment": self = .entertainment
            case "public.app-category.finance": self = .finance
            case "public.app-category.games": self = .games
            case "public.app-category.graphics-design": self = .graphicsDesign
            case "public.app-category.healthcare-fitness": self = .healthcareFitness
            case "public.app-category.lifestyle": self = .lifestyle
            case "public.app-category.medical": self = .medical
            case "public.app-category.music": self = .music
            case "public.app-category.news": self = .news
            case "public.app-category.photography": self = .photography
            case "public.app-category.productivity": self = .productivity
            case "public.app-category.reference": self = .reference
            case "public.app-category.social-networking": self = .socialNetworking
            case "public.app-category.sports": self = .sports
            case "public.app-category.travel": self = .travel
            case "public.app-category.utilities": self = .utilities
            case "public.app-category.video": self = .video
            case "public.app-category.weather": self = .weather
            default: return nil
            }
        }
    }
}
