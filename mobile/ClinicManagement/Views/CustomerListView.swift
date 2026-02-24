import SwiftUI

struct CustomerListView: View {
    @ObservedObject private var dataManager = DataManager.shared
    @State private var showingAddCustomer = false
    
    var body: some View {
        NavigationView {
            List {
                ForEach(dataManager.customers) { customer in
                    HStack {
                        Text(customer.name)
                        Spacer()
                        Text("\(customer.tariffDefault) / \(customer.tariffParents)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
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
    @ObservedObject private var dataManager = DataManager.shared
    @State private var name = ""
    @State private var tariff = ""
    @State private var parentTariff = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Basic Information")) {
                    TextField("Full Name", text: $name)
                }
                
                Section(header: Text("Tariffs (NIS)")) {
                    TextField("Default (Child)", text: $tariff)
                        .keyboardType(.numberPad)
                    TextField("Parent/Parents", text: $parentTariff)
                        .keyboardType(.numberPad)
                }
            }
            .navigationTitle("New Customer")
            .navigationBarItems(
                leading: Button("Cancel") { dismiss() },
                trailing: Button("Save") {
                    let newCustomer = Customer(
                        id: UUID(),
                        name: name,
                        cellPhone: nil,
                        email: nil,
                        tariffDefault: Int(tariff) ?? 300,
                        tariffParents: Int(parentTariff) ?? 450
                    )
                    Task {
                        await dataManager.addCustomer(newCustomer)
                        dismiss()
                    }
                }
                .disabled(name.isEmpty)
            )
        }
    }
}
