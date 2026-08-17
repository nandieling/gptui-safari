import Foundation
import SafariServices

final class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    func beginRequest(with context: NSExtensionContext) {
        let response = NSExtensionItem()
        response.userInfo = [
            SFExtensionMessageKey: [
                "message": "gpt-ui is ready."
            ]
        ]
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
}
