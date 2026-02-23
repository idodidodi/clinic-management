import SwiftUI

struct CustomerListView: View {
    @State private var showingAddCustomer = false
    
    var body: some View {
        NavigationView {
            List {
                HStack {
                    Text("John Doe")
                    Spacer()
                    Text("300 / 400")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                HStack {
                    Text("Jane Smith")
                    Spacer()
                    Text("250 / 350")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .navigationTitle("Customers")
            .toolbar {
                Button(action: { showingAddCustomer = true }) {
                    Image(systemName: "plus")
                }
            }
            .sheet(isPresented: $showingAddCustomer) {
                AddCustomerView()
            }
        }
    }
}

struct AddCustomerView: View {
    @Environment(\.dismiss) var dismiss
    @State private var name = ""
    @State private var tariff = ""
    
    var body: some View {
        NavigationView {
            Form {
                TextField("Name", text: $name)
                TextField("Default Tariff", text: $tariff)
                    .keyboardType(.numberPad)
            }
            .navigationTitle("New Customer")
            .navigationBarItems(trailing: Button("Save") {
                dismiss()
            })
        }
    }
}
