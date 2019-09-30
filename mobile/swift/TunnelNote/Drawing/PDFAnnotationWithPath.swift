//
//  PDFAnnotationWithPath.swift
//  TunnelNote
//
//  Created by 정진우 on 21/09/2019.
//  Copyright © 2019 정진우. All rights reserved.
//

import Foundation
import PDFKit

extension PDFAnnotation{
    func contains(point: CGPoint) -> Bool {
        
        var hitPath: CGPath?
        
        if let path = paths?.first{
            hitPath = path.cgPath.copy(strokingWithWidth: 10.0, lineCap: .round, lineJoin: .round, miterLimit: 0)
        }
        
        return hitPath?.contains(point) ?? false
    }
}
