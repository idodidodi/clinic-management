import SwiftUI

struct ReportingView: View {
    @State private var selectedCustomer: Customer?
    @State private var meetingType: MeetingType = .child
    @State private var customCost: String = ""
    @State private var cashAmount: String = ""
    @State private var payerName: String = ""
    @State private var showingSuccessAlert = false
    
    // Mock data for initial preview
    let mockCustomers = [
        Customer(id: UUID(), name: "John Doe", tariffDefault: 300, tariffParents: 400),
        Customer(id: UUID(), name: "Jane Smith", tariffDefault: 250, tariffParents: 350)
    ]
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Customer Selection
                Menu {
                    ForEach(mockCustomers) { customer in
                        Button(customer.name) {
                            selectedCustomer = customer
                        }
                    }
                } label: {
                    HStack {
                        Text(selectedCustomer?.name ?? "Select Customer")
                            .font(.title3)
                            .foregroundColor(selectedCustomer == nil ? .gray : .primary)
                        Spacer()
                        Image(systemName: "chevron.down")
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                }
                .padding(.horizontal)
                
                Divider()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Section: Report Meeting
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Report Meeting")
                                .font(.headline)
                                .foregroundColor(.secondary)
                            
                            Picker("Type", selection: $meetingType) {
                                ForEach(MeetingType.allCases, id: \.self) { type in
                                    Text(type.rawValue.capitalized).tag(type)
                                }
                            }
                            .pickerStyle(SegmentedPickerStyle())
                            
                            TextField("Custom Cost (Optional)", text: $customCost)
                                .keyboardType(.numberPad)
                                .padding()
                                .background(Color(.systemGray6))
                                .cornerRadius(8)
                            
                            Button(action: reportMeeting) {
                                Text("Save Meeting")
                                    .fontWeight(.bold)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(selectedCustomer == nil ? Color.gray : Color.blue)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }
                            .disabled(selectedCustomer == nil)
                        }
                        .padding()
                        .background(Color(.systemBackground))
                        .cornerRadius(16)
                        .shadow(radius: 2)
                        
                        // Section: Report Cash Payment
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Report Cash Payment")
                                .font(.headline)
                                .foregroundColor(.secondary)
                            
                            TextField("Amount (NIS)", text: $cashAmount)
                                .keyboardType(.numberPad)
                                .padding()
                                .background(Color(.systemGray6))
                                .cornerRadius(8)
                            
                            TextField("Payer Name", text: $payerName)
                                .padding()
                                .background(Color(.systemGray6))
                                .cornerRadius(8)
                            
                            Button(action: reportPayment) {
                                Text("Save Cash Payment")
                                    .fontWeight(.bold)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(selectedCustomer == nil || cashAmount.isEmpty ? Color.gray : Color.green)
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                            }
                            .disabled(selectedCustomer == nil || cashAmount.isEmpty)
                        }
                        .padding()
                        .background(Color(.systemBackground))
                        .cornerRadius(16)
                        .shadow(radius: 2)
                    }
                    .padding()
                }
            }
            .navigationTitle("Quick Report")
            .background(Color(.systemGroupedBackground))
            .alert("Success", isPresented: $showingSuccessAlert) {
                Button("OK", role: .cancel) { }
            } message: {
                Text("Reported successfully.")
            }
        }
    }
    
    func reportMeeting() {
        // Logic to save to Supabase will go here
        showingSuccessAlert = true
        customCost = ""
    }
    
    func reportPayment() {
        // Logic to save to Supabase will go here
        showingSuccessAlert = true
        cashAmount = ""
        payerName = ""
    }
}

struct ReportingView_Previews: PreviewProvider {
    static var previews: some View {
        ReportingView()
    }
}
