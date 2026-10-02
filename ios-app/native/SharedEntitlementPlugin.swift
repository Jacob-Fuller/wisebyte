import Capacitor

/// Lets the four Wisebyte apps share the "All Access active" record
/// through the App Group group.au.wisebyte.shared. store.js calls
/// SharedEntitlement.get / .set; if this plugin is missing the app
/// simply falls back to its own purchases.
@objc(SharedEntitlementPlugin)
public class SharedEntitlementPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SharedEntitlementPlugin"
    public let jsName = "SharedEntitlement"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "get", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "set", returnType: CAPPluginReturnPromise)
    ]

    @objc func get(_ call: CAPPluginCall) {
        let defaults = UserDefaults(suiteName: call.getString("group") ?? "")
        call.resolve(["value": defaults?.string(forKey: call.getString("key") ?? "") ?? ""])
    }

    @objc func set(_ call: CAPPluginCall) {
        let defaults = UserDefaults(suiteName: call.getString("group") ?? "")
        defaults?.set(call.getString("value"), forKey: call.getString("key") ?? "")
        call.resolve()
    }
}
