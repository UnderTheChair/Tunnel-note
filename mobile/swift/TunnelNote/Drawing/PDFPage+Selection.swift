//
//  PDFPage+Selection.swift
//  TunnelNote
//
//  Created by 정진우 on 21/09/2019.
//  Copyright © 2019 정진우. All rights reserved.
//

import Foundation
import PDFKit

extension PDFPage{
    
    func annotationWithHitTest(at : CGPoint) -> PDFAnnotation? {
        
        for annotation in annotations {
            if annotation.contains(point : at){
                return annotation
            }
        }
        
        return nil
    }
}
