import CoreGraphics
import Foundation
import ImageIO

let arguments = CommandLine.arguments
guard arguments.count == 3 else {
    FileHandle.standardError.write(Data("usage: AppIcon-render <source.svg> <output.png>\n".utf8))
    exit(2)
}

enum Element {
    case rect(x: CGFloat, y: CGFloat, width: CGFloat, height: CGFloat, rx: CGFloat, ry: CGFloat, fill: [CGFloat])
    case circle(cx: CGFloat, cy: CGFloat, radius: CGFloat, fill: [CGFloat])

    var color: [CGFloat] {
        switch self {
        case .rect(_, _, _, _, _, _, let fill), .circle(_, _, _, let fill):
            return fill
        }
    }
}

func attributes(in tag: String) -> [String: String] {
    var attributes: [String: String] = [:]
    guard let regex = try? NSRegularExpression(pattern: #"(\w+)="([^"]+)""#) else {
        return attributes
    }
    let range = NSRange(tag.startIndex..., in: tag)
    regex.enumerateMatches(in: tag, range: range) { match, _, _ in
        guard let match,
              let keyRange = Range(match.range(at: 1), in: tag),
              let valueRange = Range(match.range(at: 2), in: tag) else {
            return
        }
        attributes[String(tag[keyRange])] = String(tag[valueRange])
    }
    return attributes
}

func color(from hex: String) -> [CGFloat] {
    var digits = hex
    if digits.hasPrefix("#") {
        digits.removeFirst()
    }
    guard digits.count == 6, let value = UInt32(digits, radix: 16) else {
        return [1, 1, 1, 1]
    }
    return [
        CGFloat((value >> 16) & 0xFF) / 255,
        CGFloat((value >> 8) & 0xFF) / 255,
        CGFloat(value & 0xFF) / 255,
        1,
    ]
}

func parseElements(in source: String) -> [Element] {
    var elements: [Element] = []
    guard let regex = try? NSRegularExpression(pattern: "<(rect|circle)([^>]*)/>") else {
        return elements
    }
    let range = NSRange(source.startIndex..., in: source)
    regex.enumerateMatches(in: source, range: range) { match, _, _ in
        guard let match,
              let nameRange = Range(match.range(at: 1), in: source),
              let bodyRange = Range(match.range(at: 2), in: source) else {
            return
        }
        let name = String(source[nameRange])
        let attributes = attributes(in: String(source[bodyRange]))
        let fill = color(from: attributes["fill"] ?? "#ffffff")
        switch name {
        case "rect":
            let x = CGFloat(Double(attributes["x"] ?? "0") ?? 0)
            let y = CGFloat(Double(attributes["y"] ?? "0") ?? 0)
            let width = CGFloat(Double(attributes["width"] ?? "0") ?? 0)
            let height = CGFloat(Double(attributes["height"] ?? "0") ?? 0)
            let rx = CGFloat(Double(attributes["rx"] ?? "0") ?? 0)
            let ry = CGFloat(Double(attributes["ry"] ?? "0") ?? 0)
            elements.append(.rect(x: x, y: y, width: width, height: height, rx: rx, ry: ry, fill: fill))
        case "circle":
            let cx = CGFloat(Double(attributes["cx"] ?? "0") ?? 0)
            let cy = CGFloat(Double(attributes["cy"] ?? "0") ?? 0)
            let radius = CGFloat(Double(attributes["r"] ?? "0") ?? 0)
            elements.append(.circle(cx: cx, cy: cy, radius: radius, fill: fill))
        default:
            break
        }
    }
    return elements
}

let sourcePath = arguments[1]
let outputPath = arguments[2]

guard let source = try? String(contentsOfFile: sourcePath, encoding: .utf8) else {
    FileHandle.standardError.write(Data("could not read source.svg\n".utf8))
    exit(2)
}

let elements = parseElements(in: source)
guard !elements.isEmpty else {
    FileHandle.standardError.write(Data("no shapes found in source.svg\n".utf8))
    exit(2)
}

let size = 1024
let colorSpace = CGColorSpaceCreateDeviceRGB()
guard let context = CGContext(
    data: nil,
    width: size,
    height: size,
    bitsPerComponent: 8,
    bytesPerRow: 0,
    space: colorSpace,
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
) else {
    exit(2)
}

context.clear(CGRect(x: 0, y: 0, width: size, height: size))

for element in elements {
    let fill = element.color
    context.setFillColor(
        CGColor(red: fill[0], green: fill[1], blue: fill[2], alpha: fill[3])
    )
    switch element {
    case .rect(let x, let y, let width, let height, let rx, let ry, _):
        let path = CGPath(
            roundedRect: CGRect(x: x, y: y, width: width, height: height),
            cornerWidth: rx,
            cornerHeight: ry,
            transform: nil
        )
        context.addPath(path)
        context.fillPath()
    case .circle(let cx, let cy, let radius, _):
        context.fillEllipse(
            in: CGRect(x: cx - radius, y: cy - radius, width: radius * 2, height: radius * 2)
        )
    }
}

guard let image = context.makeImage() else {
    exit(2)
}

guard let destination = CGImageDestinationCreateWithURL(
    URL(fileURLWithPath: outputPath) as CFURL,
    "public.png" as CFString,
    1,
    nil
) else {
    exit(2)
}

CGImageDestinationAddImage(destination, image, nil)
CGImageDestinationFinalize(destination)