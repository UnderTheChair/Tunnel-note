//
//  DrawingAnnotation.swift
//  TunnelNote
//
//  Created by 정진우 on 21/09/2019.
//  Copyright © 2019 정진우. All rights reserved.
//

import Foundation
import PDFKit

class DrawingAnnotation : PDFAnnotation{
    
    public var path = UIBezierPath()
    
    func completed() {
        add(path)
    }
    
    override func draw(with box: PDFDisplayBox, in context: CGContext) {
        
        let pathCopy = path.copy() as! UIBezierPath // to make this method thread safe we replaced path with its copy
        
        UIGraphicsPushContext(context)
        
        context.saveGState()
        context.setShouldAntialias(true)
        
        color.set()
        
        // To eliminate drawing artifacts we'd added some extra settings
        pathCopy.lineJoinStyle = .round
        pathCopy.lineCapStyle = .round
        
        pathCopy.lineWidth = border?.lineWidth ?? 1.0
        pathCopy.stroke()   // this is actual drawing call
        
        context.restoreGState()
        
        UIGraphicsPopContext()
        
    }
    
    
}
