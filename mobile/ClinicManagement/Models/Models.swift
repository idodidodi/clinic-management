import Foundation

struct Customer: Identifiable, Codable {
    let id: UUID
    var name: String
    var cellPhone: String?
    var email: String?
    var tariffDefault: Int
    var tariffParents: Int
}

enum MeetingType: String, CaseIterable, Codable {
    case child = "CHILD"
    case parent = "PARENT"
    case parents = "PARENTS"
}

struct Meeting: Identifiable, Codable {
    let id: UUID
    let customerId: UUID
    var date: Date
    var type: MeetingType
    var customCost: Int?
    var isPaid: Bool
}

struct Payment: Identifiable, Codable {
    let id: UUID
    let customerId: UUID
    var payerName: String
    var amount: Int
    var date: Date
    var method: PaymentMethod
}

enum PaymentMethod: String, CaseIterable, Codable {
    case cash = "CASH"
    case bit = "BIT"
    case paybox = "PAYBOX"
    case bankDraft = "BANK_DRAFT"
}
