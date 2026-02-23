import SwiftUI

struct HistoryView: View {
    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Recent Activity")) {
                    HStack {
                        VStack(alignment: .leading) {
                            Text("John Doe")
                                .fontWeight(.bold)
                            Text("Child Meeting")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                        Text("300 NIS")
                            .foregroundColor(.blue)
                    }
                    
                    HStack {
                        VStack(alignment: .leading) {
                            Text("Jane Smith")
                                .fontWeight(.bold)
                            Text("Cash Payment")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                        Text("250 NIS")
                            .foregroundColor(.green)
                    }
                }
            }
            .navigationTitle("History")
        }
    }
}
