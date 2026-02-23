import SwiftUI

@main
struct ClinicManagementApp: App {
    var body: some Scene {
        WindowGroup {
            MainTabView()
        }
    }
}

struct MainTabView: View {
    var body: some View {
        TabView {
            ReportingView()
                .tabItem {
                    Label("Report", systemImage: "plus.circle.fill")
                }
            
            HistoryView()
                .tabItem {
                    Label("History", systemImage: "clock.fill")
                }
            
            CustomerListView()
                .tabItem {
                    Label("Customers", systemImage: "person.2.fill")
                }
        }
    }
}
