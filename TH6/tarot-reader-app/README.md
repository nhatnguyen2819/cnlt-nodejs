# Tarot Reader App

A mystical web application for tarot readings built with Node.js, Express, and custom event emitters and streams.

## Features

- **Event-Driven Tarot Readings**: Uses custom EventEmitter for handling tarot events
- **Stream Processing**: MysticalTransform and EchoDuplex streams for data processing
- **Web Interface**: HTML pages served by Express server
- **Static Assets**: Images and data files served from public directory

## Installation

1. Navigate to the project directory:
   ```bash
   cd tarot-reader-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and go to `http://localhost:3000`

3. Navigate through the different pages:
   - Home: Main tarot interface
   - Events: View tarot events
   - Request: Submit a reading request
   - Streams: Learn about stream processing

## Project Structure

```
tarot-reader-app/
├── server.js              # Main Express server
├── package.json           # Node.js dependencies
├── events/
│   └── TarotEmitter.js    # Custom event emitter for tarot events
├── streams/
│   ├── MysticalTransform.js # Transform stream for mystical data
│   └── EchoDuplex.js      # Duplex stream for echoing data
├── views/
│   ├── index.html         # Main page
│   ├── events.html        # Events page
│   ├── request.html       # Reading request page
│   └── streams.html       # Streams info page
└── public/
    ├── images/
    │   └── card.jpg       # Tarot card image (placeholder)
    └── data/
        ├── meanings.txt   # Tarot card meanings
        └── log.txt        # Reading log
```

## Troubleshooting

- **Server not starting**: Ensure port 3000 is available
- **Images not loading**: Check that card.jpg is a valid image file
- **Dependencies issues**: Run `npm install` to install required packages
- **File not found errors**: Ensure all files are in the correct directories

## Development

To modify the app:
- Edit `server.js` for server logic
- Update HTML files in `views/` for UI changes
- Modify event/stream classes for backend functionality
- Add new tarot data to `public/data/meanings.txt`