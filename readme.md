**Welcome to Tac-Nav!**

Tac-Nav is an Expo project, which allows you to quickly develop and test your mobile application using a single JavaScript codebase. This project is a TypeScript-based React application, providing type safety and improved code maintainability.

To get started, simply run the command "expo start" in your terminal. This will initialize the project and create the necessary ".expo" folder. Remember not to commit the ".expo" folder, as it is specific to your machine and doesn't contain any information relevant to other developers working on the project.

The project structure is well-organized, with a clear separation of concerns and a logical grouping of related files. The main directories and files you'll find include:

1. `app`: Contains the main entry points and core components of the application.
2. `assets`: Houses static assets like images, logos, and fonts.
3. `components`: A directory containing reusable UI components.
4. `constants`: Stores global constants.
5. `contexts`: Contains the contexts used throughout the application.
6. `hooks`: A directory for custom hooks.
7. `screens`: The main directory for the application's screens.
8. `supabaseClient`: A directory containing the client for the Supabase database.
9. `types`: A directory for TypeScript type definitions.
10. `utils`: A directory for utility functions.

The project also uses contexts (`contexts` directory) for managing shared state across the application and interacts with a Supabase database through the `supabaseClient` directory.

To run the app on your device or emulator, use the "android" or "ios" scripts. You can also start the app in development mode with a Web-based UI using the "web" script.

We hope this overview helps you understand the project's layout and organization. Happy coding!
