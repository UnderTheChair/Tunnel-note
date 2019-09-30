//
//  ViewController.swift
//  TunnelNote
//
//  Created by 정진우 on 21/09/2019.
//  Copyright © 2019 정진우. All rights reserved.
//

import UIKit
import PDFKit
import Foundation

class ViewController: UIViewController {
    
    private let pdfDrawer = PDFDrawer()
    
    @IBOutlet weak var pdfView : PDFView!
    @IBOutlet weak var thumbnailView : PDFThumbnailView!
    @IBOutlet weak var toolBar : UIToolbar!
    let socket = SocketControll.socket
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.socket.connect()
        toolBar.items = makeToolbarItems()
        
        
    }
    
    // This code is required to fix PDFView Scroll Position when NOT using pdfView.usePageViewController(true)
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        setupPDF()
        
        let pdfDrawingGestureRecognizer = DrawingGestureRecognizer()
        // Registered the pdfDrawingGestureRecognizer created by us to pdfView.
        pdfView.addGestureRecognizer(pdfDrawingGestureRecognizer)
        pdfDrawingGestureRecognizer.drawingDelegate = pdfDrawer
        pdfDrawer.pdfView = pdfView
        
        guard let path = Bundle.main.url(forResource: "pdf", withExtension: "pdf") else{
            print("Not found the PDF file!")
            return
        }
        
        pdfView.document = PDFDocument(url:path)
        
    
    }
    
    private func setupPDF(){
        pdfView.displayDirection = .vertical
        pdfView.usePageViewController(true)
        pdfView.pageBreakMargins = UIEdgeInsets(top:0,left:0,bottom:0,right:0)
        pdfView.autoScales = true
        
        thumbnailView.pdfView = pdfView
        thumbnailView.thumbnailSize = CGSize(width: 100, height: 100)
        thumbnailView.layoutMode = .vertical
        thumbnailView.backgroundColor = UIColor.lightGray
    }
    
    private func makeToolbarItems() -> [UIBarButtonItem]{
        let space = UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: toolBar, action: nil )
        let edgeSpace = UIBarButtonItem(barButtonSystemItem: .fixedSpace, target: toolBar, action: nil )
        
        let drawButtonItem = UIBarButtonItem(barButtonSystemItem: .compose, target: nil, action: #selector(setDrawToolToPen))
        let eraserButtonItem = UIBarButtonItem(barButtonSystemItem: .trash, target: nil, action: #selector(setDrawToolToEraser))
        
        
        return [edgeSpace, drawButtonItem, space, eraserButtonItem, space, edgeSpace]
        
    }
    
    @objc private func setDrawToolToPen(){
        pdfDrawer.drawingTool = .pen
        
    }
    
    @objc private func setDrawToolToEraser(){
        pdfDrawer.drawingTool = .eraser
        print("eraser")
        
    }
}
