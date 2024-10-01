# Welcome to Tactical Navigator! 🚀

Tactical Navigator is a mobile application built using **React Native** with **Expo**. It allows you to develop and test your app on multiple platforms from a single JavaScript codebase. With **TypeScript** integrated, the project provides type safety and improved maintainability for a scalable and reliable codebase.

This repository is structured to encourage clean, modular code and efficient collaboration. The following guide will help you get started, understand the project's structure, and run it effectively.

---

## Getting Started

To begin developing with Tactical Navigator, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Tactical Navigator.git
cd Tactical Navigator
```

### 2. Install Dependencies

Ensure you have Node.js installed, then run:

```bash
npm install
```

This will install all the necessary dependencies for the project.

### 3. Start the Development Server

You can start Expo's development environment with the following command:

```bash
expo start
```

This command will initialize the Expo development server and open the Expo Developer Tools in your browser.

### 4. Run on Devices

To run the app on an emulator or physical device, use the following commands:

- **Android**: `expo run:android`
- **iOS**: `expo run:ios` (Requires MacOS)
- **Web**: `expo start --web`

### 5. Exclude `.expo` from Git

Make sure not to commit the `.expo` folder. This directory contains local environment settings and should be excluded from the version control system. The `.gitignore` file has already been set up to prevent committing this folder.

---

## Project Structure

Tactical Navigator has a well-organized folder structure that makes it easy to navigate, maintain, and scale the project:

```plaintext
.
├── app/                # Core application logic and main entry points
├── assets/             # Static assets (images, fonts, etc.)
├── components/         # Reusable UI components
├── constants/          # Global constants
├── contexts/           # React contexts for shared state management
├── hooks/              # Custom React hooks
├── screens/            # Screens for the app (like pages)
├── supabaseClient/     # Supabase database client configuration
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── package.json        # Project metadata and dependencies
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

### Directory Overview

- **app/**: Entry points and core components of the application.
- **assets/**: Store static assets like images, logos, and fonts.
- **components/**: Reusable UI components that can be used across different parts of the app.
- **constants/**: Global constants such as configuration variables.
- **contexts/**: React contexts to manage shared state (e.g., authentication, theme).
- **hooks/**: Custom React hooks for business logic.
- **screens/**: Each screen or view of the application, such as login, home, profile, etc.
- **supabaseClient/**: Configuration for interacting with the Supabase database.
- **types/**: TypeScript interfaces, types, and custom type definitions used across the project.
- **utils/**: Utility functions such as date formatting, API request handlers, etc.

---

## Key Technologies

Tactical Navigator leverages modern tools to ensure an optimal development experience:

- **Expo**: A framework for building React Native applications.
- **React Native**: Cross-platform mobile app framework.
- **TypeScript**: A strongly typed programming language that builds on JavaScript.
- **Supabase**: Backend-as-a-service (BaaS) built on PostgreSQL for authentication, database, and real-time data handling.

---

## Context and State Management

Tactical Navigator uses React **Context API** for global state management across the application. Contexts can be found in the `contexts/` directory, and they manage data like user authentication, theme settings, and other app-wide states.

---

## Supabase Integration

The project is integrated with **Supabase** to handle authentication, database operations, and real-time data updates. All interactions with Supabase are handled through the `supabaseClient/` directory, where the client is set up and API functions are defined.

### Setting up Supabase

Before running the app, make sure you have the following environment variables set up in a `.env` file:

```plaintext
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-anon-key>
```

Replace the placeholders with your actual Supabase credentials.

---

## Running Tests

Tactical Navigator uses **Jest** for testing. To run the test suite, use the following command:

```bash
npm test
```

This will run all unit tests and ensure your code is working as expected.

---

## Contributing

We welcome contributions! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add new feature'`).
5. Push to your branch (`git push origin feature/your-feature`).
6. Open a Pull Request.

Please ensure your code adheres to the following:

- **Code Quality**: Ensure that code is clean and well-commented.
- **Testing**: Write tests for any new features or bug fixes.
- **Documentation**: Update documentation to reflect any changes.

---

## License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute it as needed.

---

## Acknowledgments

Thank you to all the contributors and the open-source community that make projects like Tactical Navigator possible. We hope this project helps you kickstart your next mobile app adventure!

---

Happy Coding! 🎉
