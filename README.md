<img src="icons/music-services-search-icon.png" alt="Music Services Search Icon" height="70">

# Music Services Search
**Music Services Search** is a powerful and intuitive tool designed to elevate your online music discovery experience. With just a right-click, you can instantly search for tracks on Spotify, YouTube, YouTube Music, and Bandcamp.
### Features
-   **Customizable Options:** Select which services to enable for a personalized experience.
-   **Seamless Interface:** Enjoy an elegant and user-friendly design that simplifies your navigation.
-   **Music Discovery Made Easy:** Whether you’re a casual listener or a passionate music enthusiast, this extension is the perfect companion to explore and enjoy music online.
---
## Installation Instructions
To use this extension in Chrome, follow these steps to load it as an unpacked extension:
1. **Download the Code:**
    - Clone this repository or download it as a ZIP file:
    - If you downloaded the ZIP file, extract its contents to a folder on your computer.
2. **Open Chrome Extensions:**
    - In Chrome, go to `chrome://extensions/` or open the Extensions menu by clicking on the three-dot menu → **More tools** → **Extensions**.
3. **Enable Developer Mode:**
    - Toggle the **Developer mode** switch in the top-right corner of the Extensions page.
4. **Load Unpacked Extension:**
    - Click the **Load unpacked** button.
    - Select the folder where you extracted or cloned the repository.
5. **Start Using the Extension:**
    - Once loaded, the extension will appear in your toolbar or in the Extensions menu.
    - Customize the settings as needed and start discovering music effortlessly!
---
## Development

### Running Tests
This extension includes an automated test suite using Jest. To run the tests:

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Tests:**
   ```bash
   npm test
   ```

3. **Run Tests in Watch Mode** (for development):
   ```bash
   npm run test:watch
   ```

### Test Coverage
The test suite includes:
- Unit tests for background script functionality
- Unit tests for options page behavior
- Tests for internationalization (i18n) 
- Query string cleaning and sanitization tests
- Integration tests simulating user interactions

Feel free to open an issue or submit a pull request if you have suggestions or encounter any issues!

