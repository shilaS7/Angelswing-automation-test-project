# Angelswing App Test Automation Project

## Overview

This project is a **Test Automation Framework** built using **Playwright**, **TypeScript**, and **Page Object Model (POM)**. The goal of this framework is to automate both **UI (User Interface)** and **API (Application Programming Interface)** tests for the application. Playwright allows for cross-browser testing (Chromium, Firefox, and WebKit), parallel execution, and the framework is designed to be **scalable** and **maintainable**.

---

## Project Setup

### Prerequisites

Before setting up this project, ensure you have the following installed:

- **Node.js** (version 18.x or higher)
- **npm** (Node package manager)
- **Playwright** (installed automatically through npm)
- **TypeScript** (for running the TypeScript-based tests)

### Installation

1. **Clone the repository:**

   First, clone the repository to your local machine:

   ```bash
   git clone https://github.com/suraj-angelswing/angelswing-automation-test.git
   cd angelswing-automation-test
   ```

2. **Install dependencies:**

   Run the following command to install all the required dependencies for the project:

   ```bash
   npm install
   ```

   This will install:
   - Playwright and other testing libraries
   - TypeScript and TypeScript related tools
   - All project dependencies defined in `package.json`

---

## Environment Configuration

1. **Create `.env` file:**

   Create a `.env` file in the root directory of the project. This file will store all environment-specific variables like API URLs, credentials, etc.

   Example `.env` file:

   ```env
   # Base URLs
   BASE_URL=https://your-application-url.com
   API_URL=https://your-api-url.com

   # Credentials 
   EMAIL=''
   PASSWORD=''
   
   # Email Service for testing
   WEBHOOK_URL=https://webhook.site
   EMAIL_HOOK_URL=emailhook.site
   ```

2. **Environment Variables:**
   - **BASE_URL**: URL of the application under test (for UI tests).
   - **API_URL**: URL for your API (for API tests).
   - **EMAIL** and **PASSWORD**: Required credentials for authentication in tests.


---

## Running the Tests

### 1. **Running UI Tests in Headless Mode (No Browser UI):**

To run the **UI tests** (Frontend tests) in **headless mode**, run the following command:

```bash
npx playwright test tests/frontend-tests
```

This will execute all UI tests defined in the `frontend-tests/` folder. **Headless mode** means Playwright will run the tests in the background without opening a browser window, making it faster.

### 2. **Running API Tests in Headless Mode:**

To run the **API tests** (backend tests) in **headless mode**, execute the following command:

```bash
npx playwright test tests/api-tests
```

This will run all the API tests defined in the `api-tests/` folder.

### 3. **Run All Tests in Headless Mode:**

To run both **UI** and **API** tests together in **headless mode**, simply run:

```bash
npx playwright test
```

### 4. **Running Specific Tests:**

To run a specific test file, use the following command:

```bash
npx playwright test tests/frontend-tests/login.spec.ts
```

Or for API tests:

```bash
npx playwright test tests/api-tests/auth.spec.ts
```

### 5. **Run Tests in UI Mode (With Visible Browser):**

To run tests in **UI mode** (where the browser UI is visible), use the following command:

```bash
npx playwright test --ui
```

**UI mode** lets you explore, run, and debug tests with a time travel experience complete with a watch mode. All test files are displayed in the testing sidebar, allowing you to expand each file and describe block to individually run, view, watch, and debug each test.

---

## Additional Information

### Customizing the Tests

- **Page Object Model (POM)**: Each page of the application has its own page object file (e.g., `LoginPage.ts`). You can add new page objects by creating new classes under the `pages/` directory. Use these objects in your test files to interact with the UI.
  
- **Test Options**: The `test-options.ts` file customizes test execution, making `PageManager` available to all tests for clean and organized code.

### Test Structure

- **UI Tests**: Located in the `tests/frontend-tests/` folder, these tests interact with the application's UI (e.g., login, form submission, map operations, etc.).
  
- **API Tests**: Located in the `tests/api-tests/` folder, these tests interact with the backend (e.g., authentication, data fetching, etc.).

---

### **Explanation:**

1. **Overview**: A brief description of the project's objective.
2. **Project Setup**: Instructions on how to set up and install the project.
3. **Prerequisites**: The tools and software required for the project to run.
4. **Installation**: Steps for cloning the repository, installing dependencies, and setting up the environment.
5. **Environment Configuration**: Details on setting up the `.env` file for environment variables such as API URLs and credentials.
6. **Running the Tests**: Clear instructions on how to run the tests, including for UI and API tests, and how to run specific tests.
7. **Customizing the Tests**: Guidelines on how to extend the framework by adding page objects and test options.
8. **Test Modes**: Explanation of **headless mode** (no browser UI) and **UI mode** (with browser UI) and how they affect test execution.
