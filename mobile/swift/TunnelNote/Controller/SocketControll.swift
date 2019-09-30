//
//  SocketControll.swift
//  TunnelNote
//
//  Created by 정진우 on 28/09/2019.
//  Copyright © 2019 정진우. All rights reserved.
//

import Foundation
import SocketIO

class SocketControll{
    static let socketManager = SocketManager(socketURL: URL(string:"http://13.209.96.255:8000")!)
    static let socket = socketManager.defaultSocket
}
