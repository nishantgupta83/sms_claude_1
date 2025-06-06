{
  "name": "SMS Bridge - Secure Monitoring",
  "short_name": "SMS Bridge",
  "description": "Secure SMS monitoring and bridge application",
  "version": "1.0.0",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#2196F3",
  "background_color": "#667eea",
  "scope": "/",
  "lang": "en-US",
  "dir": "ltr",
  "categories": ["utilities", "communication"],
  "screenshots": [
    {
      "src": "screenshots/mobile-screenshot-1.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "SMS Bridge main interface"
    }
  ],
  "icons": [
    {
      "src": "icons/icon-72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Connect Device",
      "short_name": "Connect",
      "description": "Connect to SMS monitoring server",
      "url": "/?action=connect",
      "icons": [
        {
          "src": "icons/icon-96.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "View Messages",
      "short_name": "Messages",
      "description": "View recent SMS messages",
      "url": "/?action=messages",
      "icons": [
        {
          "src": "icons/icon-96.png",
          "sizes": "96x96"
        }
      ]
    }
  ],
  "related_applications": [],
  "prefer_related_applications": false,
  "protocols": [
    {
      "protocol": "web+smsbridge",
      "url": "/?protocol=%s"
    }
  ],
  "edge_side_panel": {
    "preferred_width": 400
  },
  "launch_handler": {
    "client_mode": "navigate-existing"
  }
}
