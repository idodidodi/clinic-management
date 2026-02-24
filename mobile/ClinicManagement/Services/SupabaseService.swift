import Foundation

class SupabaseService {
    static let shared = SupabaseService()
    
    // These should be set in a real environment
    private let supabaseUrl = "YOUR_SUPABASE_URL"
    private let supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY"
    
    private init() {}
    
    func fetchCustomers() async throws -> [Customer] {
        let url = URL(string: "\(supabaseUrl)/rest/v1/customers?select=*&order=name")!
        var request = URLRequest(url: url)
        request.addValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.addValue("Bearer \(supabaseAnonKey)", forHTTPHeaderField: "Authorization")
        
        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode([Customer].self, from: data)
    }
    
    func createCustomer(customer: Customer) async throws {
        let url = URL(string: "\(supabaseUrl)/rest/v1/customers")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.addValue("Bearer \(supabaseAnonKey)", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        request.httpBody = try JSONEncoder().encode(customer)
        
        let (_, _) = try await URLSession.shared.data(for: request)
    }
    
    func reportMeeting(meeting: Meeting) async throws {
        let url = URL(string: "\(supabaseUrl)/rest/v1/meetings")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.addValue("Bearer \(supabaseAnonKey)", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        request.httpBody = try JSONEncoder().encode(meeting)
        
        let (_, _) = try await URLSession.shared.data(for: request)
    }
    
    func reportPayment(payment: Payment) async throws {
        let url = URL(string: "\(supabaseUrl)/rest/v1/payments")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.addValue("Bearer \(supabaseAnonKey)", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        request.httpBody = try JSONEncoder().encode(payment)
        
        let (_, _) = try await URLSession.shared.data(for: request)
    }
}
