import SwiftUI

class DataManager: ObservableObject {
    @Published var customers: [Customer] = MockData.customers
    @Published var meetings: [Meeting] = MockData.meetings
    @Published var payments: [Payment] = MockData.payments
    @Published var isLoading = false
    
    static let shared = DataManager()
    
    private init() {}
    
    @MainActor
    func refreshData() async {
        isLoading = true
        do {
            let fetchedCustomers = try await SupabaseService.shared.fetchCustomers()
            // In a real implementation, we would also fetch meetings and payments
            if !fetchedCustomers.isEmpty {
                self.customers = fetchedCustomers
            }
        } catch {
            print("Supabase fetch failed, falling back to mock data: \(error)")
            // Keep mock data as fallback
        }
        isLoading = false
    }
    
    @MainActor
    func addCustomer(_ customer: Customer) async {
        do {
            try await SupabaseService.shared.createCustomer(customer: customer)
            self.customers.append(customer)
            self.customers.sort { $0.name < $1.name }
        } catch {
            print("Failed to create customer in Supabase: \(error)")
            self.customers.append(customer)
            self.customers.sort { $0.name < $1.name }
        }
    }
    
    @MainActor
    func addMeeting(_ meeting: Meeting) async {
        do {
            try await SupabaseService.shared.reportMeeting(meeting: meeting)
            self.meetings.insert(meeting, at: 0)
        } catch {
            print("Failed to report meeting to Supabase: \(error)")
            self.meetings.insert(meeting, at: 0) // Local-only fallback
        }
    }
    
    @MainActor
    func addPayment(_ payment: Payment) async {
        do {
            try await SupabaseService.shared.reportPayment(payment: payment)
            self.payments.insert(payment, at: 0)
        } catch {
            print("Failed to report payment to Supabase: \(error)")
            self.payments.insert(payment, at: 0) // Local-only fallback
        }
    }
}
