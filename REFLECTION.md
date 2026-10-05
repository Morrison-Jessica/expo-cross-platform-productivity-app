# Module 1 Reflection

The biggest lesson from this project was that getting the environment ready is part of building the app. I started by inspecting the repository and available tools instead of immediately installing packages or copying course examples. Finding Node 25 made me pay attention to the difference between a newer release and Node 22 LTS. Choosing Expo SDK 55 also meant considering compatibility with the macOS and Xcode setup, rather than assuming any version would work equally well.

NativeWind was an early challenge because the course examples did not exactly match the current project structure. The app used Expo Router with screens under src/app, so the configuration paths needed to match those files. I also had to distinguish NativeWind v4 instructions from newer setup instructions. Adding one obvious temporary text color was a useful way to verify that styling worked before building the actual screens.

SQLite was the biggest surprise. I expected the same database code to behave similarly on iOS and web, but web needed additional WebAssembly support in Metro. The missing wasm asset caused a bundling error before the database test could even run. That helped me understand that sharing application code does not remove every platform difference. Settings reinforced that point: I used SecureStore on iOS and localStorage on web rather than trying to force one storage API onto both platforms.

The time constraint pushed me to work in small steps and protect the scope. I verified NativeWind, SQLite, and SecureStore separately, removed the temporary tests, and then built the three screens. Task creation came before completion, deletion, filters, and statistics. Dark Mode was the chosen enhanced feature, so I focused on making it visible across the existing screens and navigation instead of adding more preferences or visual effects.

Testing one change at a time made problems easier to narrow down. Checking the app in Chrome and on the iPhone 17 Pro simulator running iOS 26.2 was especially valuable because success on one platform did not automatically prove the other was ready.

With more time, I would add repeatable automated tests for the main user flows and spend more time checking accessibility, keyboard behavior, and smaller layouts. I would also test storage failures and database migrations more thoroughly on actual runtimes. For this assignment, keeping the app simple helped me finish a useful set of features without letting extra ideas take over.

## AI Disclosure

ChatGPT was used to assist with troubleshooting, development guidance, and documentation. All code was reviewed and approved by the author.
