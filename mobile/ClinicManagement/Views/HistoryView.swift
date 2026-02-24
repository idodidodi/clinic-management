import SwiftUI

struct HistoryView: View {
    @ObservedObject private var dataManager = DataManager.shared
    
    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Recent Activity")) {
                    ForEach(dataManager.meetings) { meeting in
                        let customerName = dataManager.customers.first(where: { $0.id == meeting.customerId })?.name ?? "Unknown"
                        HStack {
                            VStack(alignment: .leading) {
                                Text(customerName)
                                    .fontWeight(.bold)
                                Text("\(meeting.type.rawValue.capitalized) Meeting")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            Spacer()
                            Text("\(meeting.customCost ?? dataManager.customers.first(where: { $0.id == meeting.customerId })?.tariffDefault ?? 0) NIS")
                                .foregroundColor(.blue)
                        }
                    }
                    
                    ForEach(dataManager.payments) { payment in
                        HStack {
                            VStack(alignment: .leading) {
                                Text(payment.payerName)
                                    .fontWeight(.bold)
                                Text("Cash Payment")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            Spacer()
                            Text("\(payment.amount) NIS")
                                .foregroundColor(.green)
                        }
                    }
                }
            }
            .navigationTitle("History")
        }
    }
}
