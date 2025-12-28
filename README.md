# AI Voice Studio (Google GenAI TTS)

A professional, responsive web application required to convert text into natural-sounding speech using Google's generative AI and Neural2 voices. This project demonstrates a production-ready approach with a secure backend proxy, while also offering a client-side demo mode for quick testing.

## Features

-   **High-Quality Voices**: Access to Google's "Journey" (GenAI) and "Neural2" voices.
-   **Dynamic Voice Fetching**: Automatically fetches all available languages and voices from the Google API.
-   **Configurable Settings**: Adjust Speed (0.25x - 4.0x) and Pitch (-20 to +20).
-   **Responsive UI**: Modern interface built with Tailwind CSS, fully responsive on mobile and desktop.
-   **Dark Mode**: Best-in-class dark mode support with persistence.
-   **Secure Architecture**: Optional Node.js/Express backend to hide API keys in production.
-   **Audio Management**: Built-in audio player and one-click MP3 download.

## Tech Stack

-   **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (CDN).
-   **Backend**: Node.js, Express.
-   **API**: Google Cloud Text-to-Speech API (v1).

## Prerequisites

-   [Node.js](https://nodejs.org/) (v14 or higher) - *Required for backend mode.*
-   **Google Cloud API Key** with **Cloud Text-to-Speech API** enabled.

## Installation & Setup

1.  **Clone the repository** (or download source files).
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    Create a `.env` file in the root directory:
    ```env
    GOOGLE_API_KEY=your_actual_api_key_here
    PORT=3000
    ```

## Running the Application

### Option 1: Production Mode (Recommended)
Uses the local backend proxy to securely handle API requests.

1.  Start the server:
    ```bash
    npm start
    ```
2.  Open `index.html` in your web browser.
3.  In the app, click **Settings** and check **"Use Backend Proxy"**.
    *(You do not need to enter an API key in the browser)*.

### Option 2: Demo Mode (Client-Side)
Run the app without a backend. Suitable for quick testing.

1.  Open `index.html` in your web browser.
2.  Click **Settings** and enter your Google API Key.
    *(Key is stored locally in your browser's LocalStorage)*.
3.  Ensure **"Use Backend Proxy"** is unchecked.

## Usage Guide

1.  **Select Voice**:
    -   Choose your desired **Language** from the dropdown.
    -   Select a **Voice**. *Tip: "Journey" voices are the most expressive.*
2.  **Adjust Parameters** (Optional):
    -   Use the sliders to tweak **Speed** and **Pitch**.
3.  **Input Text**:
    -   Type or paste text into the main text area (up to 5000 characters).
    -   Use "Paste Sample" for a quick test.
4.  **Generate**:
    -   Click **Generate Audio**.
    -   Wait for the process to complete (usually 1-2 seconds).
5.  **Listen & Download**:
    -   The audio will play automatically.
    -   Click **Download MP3** to save the file.

## Troubleshooting

### "Requests to this API are blocked"
This usually means your API Key is restricted.
1.  Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
2.  Edit your API Key.
3.  Under **API restrictions**, ensure **Cloud Text-to-Speech API** is selected (or set to "Don't restrict key").
4.  Save and wait 1-2 minutes.

### Voice List is Empty / "Loading..."
-   Ensure your API Key is valid.
-   If using **Backend Mode**, ensure the server is running (`npm start`) and your `.env` file is correct.
-   If using **Demo Mode**, ensure you entered a valid key in the Settings panel.
-   Check the browser console (F12) for network errors.

## Project Structure

-   `index.html`: Main user interface.
-   `app.js`: Client-side logic, API calls, and UI interactions.
-   `server.js`: Node.js Express server (Proxy).
-   `package.json`: Project dependencies and scripts.
-   `README.md`: Project documentation.
