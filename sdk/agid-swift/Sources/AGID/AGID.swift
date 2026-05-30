public let base32Alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
public let agidPrefixLength = 2
public let agidHashLength = 10
public let agidTotalLength = 12

public struct AGIDResult: Equatable {
    public let id: String
    public let lat: Double
    public let lon: Double
    public let face: Int?
}

public func encode(lat: Double, lon: Double) throws -> AGIDResult {
    throw AGIDError.notImplemented
}

public func decode(_ id: String) -> AGIDResult? {
    nil
}

public enum AGIDError: Error {
    case notImplemented
}
