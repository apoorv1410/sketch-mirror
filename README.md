# Realtime Drawing Canvas with socket.io

This project is a simple web application built using HTML, CSS, and JavaScript, incorporating canvas and socket.io to enable real-time drawing collaboration.

## Features

- Real-time drawing collaboration: Multiple users can draw on the canvas simultaneously, and their changes are instantly reflected for all other users.
- Simple and intuitive user interface: The interface is designed to be minimalistic, user-friendly and easy to understand, allowing users to start drawing without any learning curve.
- Responsive design: The application is optimized for various screen sizes, making it accessible on both desktop and mobile devices.
- Audio interactivity: Added pencial and eraser sound toggles for enhanced drawing UX
- Share/Copy feature: Added 'navigaator' API support to easily share your art with others

## Setup

To set up the project locally, follow these steps:

1. Clone the repository:

   ```
   git clone https://github.com/apoorv1410/sketch-mirror.git
   ```

2. Navigate to the project directory:

   ```
   cd sketch-mirror
   ```

3. Install dependencies:

   ```
   npm install
   ```

4. Add the port config file:
   ```
   cd public && echo -e "let app_url = 'http://localhost:5500;" > config.js
   ```

5. Run the server:

   ```
   npm start
   ```

6. Open your browser and navigate to `http://localhost:5500`.

## Dependencies

- Node.js: Make sure you have Node.js installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).

## Usage

- Once the server is running, open the application in your web browser.
- Start drawing on the canvas. Your changes will be instantly synced with other users who are also accessing the application on same port.
- To collaborate with others, share the URL of the application with them.
- Live [Demo](https://sketch-mirror-production.up.railway.app/)

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or improvements, feel free to open an issue or submit a pull request.

## Acknowledgements

- This project was inspired by the need for real-time collaboration tools.
- socket.io library was used for real-time communication between clients and server.
- HTML Canvas API was used for drawing on the web page.
- navigator API was used for share/copy functionalities.
- icons by [flaticon](https://www.flaticon.com/)

## Contact

If you have any questions or inquiries, feel free to contact [Apoorv Bhatt](bhattapoorv29@gmail.com).

Happy drawing! 🎨✨