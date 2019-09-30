//
//  NonSelectablePDFView.swift
//  TunnelNote
//
//  Created by 정진우 on 21/09/2019.
//  Copyright © 2019 정진우. All rights reserved.
//

import Foundation
import PDFKit
import UIKit

class NonSelectablePDFView: PDFView{
    // Disable selection
    
    override func canPerformAction(_ action: Selector, withSender sender: Any?) -> Bool {
        return false
    }
    
    override func addGestureRecognizer(_ gestureRecognizer: UIGestureRecognizer) {
        if gestureRecognizer is UILongPressGestureRecognizer {
            gestureRecognizer.isEnabled = false
        }
        
        super.addGestureRecognizer(gestureRecognizer)
    }
}
