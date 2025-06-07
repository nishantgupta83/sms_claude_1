class DashboardApp {
    constructor() {
        this.socket = null;
        this.connectedDevices = new Map();
        this.messages = [];
        this.selectedDevice = null;
        this.isConnected = false;
        
        this.init();
    }
    
    init() {
        this.initializeElements();
        this.setupEventListeners();
        this.connectSocket();
        this.startPeriodicUpdates();
    }
    
    initializeElements() {
        // Cache DOM elements
        this.elements = {
            connectionIndicator: document.getElementById('connection-indicator'),
            connectionText: document.getElementById('connection-text'),
            devicesList: document.getElementById('devices-list'),
            deviceSelect: document.getElementById('device-select'),
            messagesContainer: document.getElementById('messages-container'),
            sendMessageForm: document.getElementById('send-message-form'),
            phoneNumberInput: document.getElementById('phone-number'),
            messageTextArea: document.getElementById('message-text'),
            totalMessages: document.getElementById('total-messages'),
            activeDevices: document.getElementById('active-devices'),
            charCounter: document.querySelector('.char-counter')
        };
    }
    
    setupEventListeners() {
        // Form submission
        this.elements.sendMessageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSendMessage();
        });
        
        // Character counter
        this.elements.messageTextArea.addEventListener('input', (e) => {
            this.updateCharCounter(e.target.value.length);
        });
        
        // Device selection
        this.elements.deviceSelect.addEventListener('change', (e) => {
            this.selectedDevice = e.target.value;
        });
    }
    
    connectSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            this.isConnected = true;
            this.updateConnectionStatus('Connected', true);
            this.registerDashboard();
            console.log('Dashboard connected to server');
        });
        
        this.socket.on('disconnect', () => {
            this.isConnected = false;
            this.updateConnectionStatus('Disconnected', false);
            console.log('Dashboard disconnected from server');
        });
        
        this.socket.on('device-connected', (device) => {
            this.handleDeviceConnected(device);
        });
        
        this.socket.on('device-disconnected', (device) => {
            this.handleDeviceDisconnected(device);
        });
        
        this.socket.on('new-message', (message) => {
            this.handleNewMessage(message);
        });
        
        // Request initial data
        this.socket.on('connect', () => {
            this.requestInitialData();
        });
    }
    
    registerDashboard() {
        const dashboardInfo = {
            type: 'dashboard',
            name: 'Parent Dashboard',
            userAgent: navigator.userAgent,
            timestamp: new Date()
        };
        
        this.socket.emit('register-device', dashboardInfo);
    }
    
    requestInitialData() {
        // Request existing messages and devices
        fetch('/api/messages')
            .then(response => response.json())
            .then(messages => {
                this.messages = messages;
                this.renderMessages();
                this.updateStats();
            })
            .catch(error => console.error('Error fetching messages:', error));
            
        fetch('/api/devices')
            .then(response => response.json())
            .then(devices => {
                devices.forEach(device => {
                    this.connectedDevices.set(device.id, device);
                });
                this.renderDevices();
                this.updateStats();
            })
            .catch(error => console.error('Error fetching devices:', error));
    }
    
    updateConnectionStatus(text, connected) {
        this.elements.connectionText.textContent = text;
        this.elements.connectionIndicator.className = 
            `status-indicator ${connected ? 'online' : 'offline'}`;
    }
    
    handleDeviceConnected(device) {
        this.connectedDevices.set(device.id, device);
        this.renderDevices();
        this.updateStats();
        this.showNotification(`Device connected: ${device.name}`, 'success');
    }
    
    handleDeviceDisconnected(device) {
        if (this.connectedDevices.has(device.id)) {
            const existingDevice = this.connectedDevices.get(device.id);
            existingDevice.connected = false;
            existingDevice.lastSeen = device.lastSeen;
            this.renderDevices();
            this.updateStats();
            this.showNotification(`Device disconnected: ${device.name}`, 'warning');
        }
    }
    
    handleNewMessage(message) {
        this.messages.unshift(message);
        
        // Keep only last 100 messages in memory
        if (this.messages.length > 100) {
            this.messages = this.messages.slice(0, 100);
        }
        
        this.renderMessages();
        this.updateStats();
        this.showNotification(`New message from ${message.from}`, 'info');
    }
    
    renderDevices() {
        const devicesArray = Array.from(this.connectedDevices.values())
            .filter(device => device.type !== 'dashboard');
            
        if (devicesArray.length === 0) {
            this.elements.devicesList.innerHTML = `
                <div class="alert alert-info">
                    No devices connected yet
                </div>
            `;
            this.elements.deviceSelect.innerHTML = `
                <option value="">No devices available</option>
            `;
            return;
        }
        
        // Render devices list
        this.elements.devicesList.innerHTML = devicesArray
            .map(device => this.createDeviceCard(device))
            .join('');
            
        // Update device select dropdown
        this.elements.deviceSelect.innerHTML = `
            <option value="">Select a device...</option>
            ${devicesArray
                .filter(device => device.connected)
                .map(device => `
                    <option value="${device.id}">
                        ${device.name} (${device.connected ? 'Online' : 'Offline'})
                    </option>
                `).join('')}
        `;
    }
    
    createDeviceCard(device) {
        const lastSeenText = device.connected ? 
            'Online' : 
            `Last seen: ${this.formatTime(device.lastSeen)}`;
            
        return `
            <div class="device-card ${device.connected ? '' : 'offline'} fade-in">
                <div class="device-name">
                    <span class="status-indicator ${device.connected ? 'online' : 'offline'}"></span>
                    ${device.name}
                </div>
                <div class="device-status">${lastSeenText}</div>
                <div class="device-info">
                    Type: ${device.type} | ID: ${device.id.substring(0, 8)}...
                </div>
            </div>
        `;
    }
    
    renderMessages() {
        if (this.messages.length === 0) {
            this.elements.messagesContainer.innerHTML = `
                <div class="message-placeholder">
                    <p>No messages yet. Messages will appear here when devices send SMS.</p>
                </div>
            `;
            return;
        }
        
        this.elements.messagesContainer.innerHTML = this.messages
            .map(message => this.createMessageItem(message))
            .join('');
            
        // Auto-scroll to top for new messages
        this.elements.messagesContainer.scrollTop = 0;
    }
    
    createMessageItem(message) {
        return `
            <div class="message-item slide-in">
                <div class="message-header">
                    <span class="message-from">${this.escapeHtml(message.from)}</span>
                    <span class="message-time">${this.formatTime(message.timestamp)}</span>
                </div>
                <div class="message-text">${this.escapeHtml(message.text)}</div>
            </div>
        `;
    }
    
    handleSendMessage() {
        const deviceId = this.elements.deviceSelect.value;
        const phoneNumber = this.elements.phoneNumberInput.value.trim();
        const messageText = this.elements.messageTextArea.value.trim();
        
        if (!deviceId) {
            this.showNotification('Please select a device', 'danger');
            return;
        }
        
        if (!phoneNumber || !messageText) {
            this.showNotification('Please fill in all fields', 'danger');
            return;
        }
        
        const messageData = {
            deviceId: deviceId,
            to: phoneNumber,
            text: messageText
        };
        
        this.socket.emit('send-message', messageData);
        
        // Clear form
        this.elements.phoneNumberInput.value = '';
        this.elements.messageTextArea.value = '';
        this.updateCharCounter(0);
        
        this.showNotification('Message sent successfully', 'success');
    }
    
    updateCharCounter(length) {
        this.elements.charCounter.textContent = `${length}/160 characters`;
        this.elements.charCounter.style.color = length > 140 ? '#dc3545' : '#666';
    }
    
    updateStats() {
        const totalMessages = this.messages.length;
        const activeDevices = Array.from(this.connectedDevices.values())
            .filter(device => device.connected && device.type !== 'dashboard').length;
            
        this.elements.totalMessages.textContent = totalMessages;
        this.elements.activeDevices.textContent = activeDevices;
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} fade-in`;
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.maxWidth = '300px';
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    startPeriodicUpdates() {
        // Update stats every 30 seconds
        setInterval(() => {
            this.updateStats();
        }, 30000);
        
        // Send heartbeat every minute
        setInterval(() => {
            if (this.socket && this.isConnected) {
                this.socket.emit('heartbeat');
            }
        }, 60000);
    }

// Handle incoming SMS messages
socket.on('sms_received', (data) => {
    displayMessage(data);
    showDashboardNotification('New SMS received!');
});

// Handle device connections
socket.on('device_connected', (data) => {
    updateDeviceList(data);
});

function displayMessage(data) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-item';
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="device-id">Device: ${data.sender}</span>
            <span class="timestamp">${new Date(data.timestamp).toLocaleString()}</span>
        </div>
        <div class="message-content">${data.message}</div>
        <div class="message-type">Type: ${data.type}</div>
    `;
    
    document.getElementById('messageHistory').prepend(messageDiv);
}

function updateDeviceList(deviceData) {
    const deviceDiv = document.createElement('div');
    deviceDiv.className = 'device-item';
    deviceDiv.innerHTML = `
        <strong>Device Connected:</strong> ${deviceData.deviceInfo?.platform || 'Unknown'}
        <br>Connected: ${new Date(deviceData.timestamp).toLocaleString()}
        <br>ID: ${deviceData.deviceId}
    `;
    
    document.getElementById('deviceList').appendChild(deviceDiv);
}

// Send notification request to all devices
document.getElementById('sendNotification').addEventListener('click', () => {
    socket.emit('broadcast_request', {
        type: 'sms_check_request',
        message: 'Please check and share any new SMS messages',
        timestamp: new Date().toISOString()
    });
    
    showDashboardNotification('SMS check request sent to all devices');
});

function showDashboardNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'dashboard-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}
    
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new DashboardApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.dashboardApp) {
        // Refresh data when page becomes visible
        window.dashboardApp.requestInitialData();
    }
});
