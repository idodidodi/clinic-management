import Foundation

struct MockData {
    static let customers = [
        Customer(id: UUID(), name: "John Doe", cellPhone: "050-1234567", email: "john@example.com", tariffDefault: 300, tariffParents: 450),
        Customer(id: UUID(), name: "Jane Smith", cellPhone: "052-7654321", email: "jane@example.com", tariffDefault: 250, tariffParents: 350),
        Customer(id: UUID(), name: "Robert Brown", cellPhone: "054-0000000", email: "robert@example.com", tariffDefault: 300, tariffParents: 450)
    ]
    
    static let meetings = [
        Meeting(id: UUID(), customerId: customers[0].id, date: Date().addingTimeInterval(-86400), type: .child, customCost: nil, isPaid: false),
        Meeting(id: UUID(), customerId: customers[1].id, date: Date().addingTimeInterval(-172800), type: .parent, customCost: nil, isPaid: true)
    ]
    
    static let payments = [
        Payment(id: UUID(), customerId: customers[1].id, payerName: "Jane Smith", amount: 350, date: Date().addingTimeInterval(-172800), method: .cash, ref: nil, details: nil)
    ]
}
