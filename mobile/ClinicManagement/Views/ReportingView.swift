import SwiftUI

    @ObservedObject private var dataManager = DataManager.shared
    @State private var selectedCustomer: Customer?
    @State private var meetingType: MeetingType = .child
    @State private var customCost: String = ""
    @State private var cashAmount: String = ""
    @State private var payerName: String = ""
    @State private var showingSuccessAlert = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Customer Selection
                Menu {
                    ForEach(dataManager.customers) { customer in
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
        guard let customer = selectedCustomer else { return }
        let meeting = Meeting(
            id: UUID(),
            customerId: customer.id,
            date: Date(),
            type: meetingType,
            customCost: Int(customCost),
            isPaid: false
        )
        Task {
            await dataManager.addMeeting(meeting)
            showingSuccessAlert = true
            customCost = ""
        }
    }
    
    func reportPayment() {
        guard let customer = selectedCustomer, let amount = Int(cashAmount) else { return }
        let payment = Payment(
            id: UUID(),
            customerId: customer.id,
            payerName: payerName.isEmpty ? customer.name : payerName,
            amount: amount,
            date: Date(),
            method: .cash,
            ref: nil,
            details: nil
        )
        Task {
            await dataManager.addPayment(payment)
            showingSuccessAlert = true
            cashAmount = ""
            payerName = ""
        }
    }
}

struct ReportingView_Previews: PreviewProvider {
    static var previews: some View {
        ReportingView()
    }
}
