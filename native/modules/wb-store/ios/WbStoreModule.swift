import ExpoModulesCore
import StoreKit
import UIKit

/* StoreKit 2 bridge: product prices and free-trial info, buying, current entitlements,
   restoring and the system "Manage subscriptions" sheet. */
final class ProductNotFoundException: Exception {
  override var reason: String { "The App Store isn't available right now. Please try again soon." }
}

public class WbStoreModule: Module {
  private var updatesTask: Task<Void, Never>? = nil

  static func unitName(_ u: Product.SubscriptionPeriod.Unit) -> String {
    switch u {
    case .day: return "day"
    case .week: return "week"
    case .month: return "month"
    case .year: return "year"
    @unknown default: return "day"
    }
  }

  public func definition() -> ModuleDefinition {
    Name("WbStore")
    Events("onChange")

    OnCreate {
      // Renewals, refunds, Ask to Buy approvals and purchases made on other devices arrive here.
      self.updatesTask = Task.detached { [weak self] in
        for await result in Transaction.updates {
          if case .verified(let t) = result { await t.finish() }
          self?.sendEvent("onChange", [:])
        }
      }
    }

    OnDestroy {
      self.updatesTask?.cancel()
    }

    AsyncFunction("products") { (ids: [String]) async throws -> [[String: Any]] in
      let products = try await Product.products(for: ids)
      var out: [[String: Any]] = []
      for p in products {
        var d: [String: Any] = ["id": p.id, "price": p.displayPrice]
        if let sub = p.subscription, let intro = sub.introductoryOffer, intro.paymentMode == .freeTrial {
          let eligible = await Product.SubscriptionInfo.isEligibleForIntroOffer(for: sub.subscriptionGroupID)
          if eligible {
            d["trialUnit"] = WbStoreModule.unitName(intro.period.unit)
            d["trialValue"] = intro.period.value
          }
        }
        out.append(d)
      }
      return out
    }

    AsyncFunction("owned") { () async -> [String] in
      var ids: [String] = []
      for await result in Transaction.currentEntitlements {
        if case .verified(let t) = result, t.revocationDate == nil {
          ids.append(t.productID)
        }
      }
      return ids
    }

    AsyncFunction("buy") { (id: String) async throws -> String in
      guard let product = try await Product.products(for: [id]).first else {
        throw ProductNotFoundException()
      }
      let result = try await product.purchase()
      switch result {
      case .success(let verification):
        switch verification {
        case .verified(let t):
          await t.finish()
          return "ok"
        case .unverified(_, _):
          return "unverified"
        }
      case .userCancelled:
        return "cancelled"
      case .pending:
        return "pending"
      @unknown default:
        return "unknown"
      }
    }

    AsyncFunction("restore") { () async throws -> Bool in
      try await AppStore.sync()
      return true
    }

    AsyncFunction("manage") { () async throws -> Bool in
      let scene: UIWindowScene? = await MainActor.run {
        UIApplication.shared.connectedScenes
          .compactMap { $0 as? UIWindowScene }
          .first { $0.activationState == .foregroundActive }
      }
      guard let scene = scene else { return false }
      try await AppStore.showManageSubscriptions(in: scene)
      return true
    }
  }
}
