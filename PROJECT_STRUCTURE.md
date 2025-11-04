# Angelswing Test Automation Project Structure

## Overview
This document provides a comprehensive overview of the Angelswing Test Automation project structure built with Playwright, TypeScript, and the Page Object Model (POM) pattern.

## Root Directory Structure

```
angelswing-automation-test/
├── .git/                           # Git version control
├── .github/                        # GitHub-specific configuration
│   └── prompts/                    # AI prompt templates for test generation
│       └── generate_test.prompt.md # Test generation prompt template
├── .gitignore                      # Git ignore configuration
├── package.json                    # Node.js dependencies and scripts
├── package-lock.json               # Dependency lock file
├── playwright.config.ts            # Playwright test configuration
├── tsconfig.json                   # TypeScript configuration
├── test-options.ts                 # Custom test options and fixtures
├── README.md                       # Project documentation
├── PROJECT_STRUCTURE.md            # This document
├── .DS_Store                       # macOS system file
├── node_modules/                   # Node.js dependencies (auto-generated)
├── allure-results/                 # Allure test results (auto-generated)
├── playwright-report/              # Playwright HTML reports (auto-generated)
├── test-results/                   # Test execution results (auto-generated)
├── downloads/                      # Test file downloads (auto-generated)
├── screenshots/                    # Test screenshots (auto-generated)
├── playwright/                     # Playwright browser binaries and auth
├── tests/                          # Test files
├── pages/                          # Page Object Model classes
├── utils/                          # Utility functions and constants
├── services/                       # External service integrations
├── test-data/                      # Test data and fixtures
└── testcontext/                    # Test context configurations
```

## Detailed Directory Breakdown

### 📁 tests/
Main test directory containing all test specifications organized by test type.

```
tests/
├── auth.setup.ts                   # Authentication setup for tests
├── dashboard-responsive-test.spec.ts # Responsive design tests
├── frontend-tests/                 # UI/Frontend test suites
│   ├── 2dDefaultSelect.spec.ts    # 2D map default selection tests
│   ├── createProject.spec.ts      # Project creation tests
│   ├── issue.spec.ts              # Issue management tests
│   ├── measurement.spec.ts        # Measurement functionality tests
│   ├── myProjects.spec.ts         # Project management tests
│   ├── pageNavigation.spec.ts     # Navigation tests
│   └── map-tests/                 # Map-specific tests
├── api-tests/                     # API/Backend test suites
│   └── auth.spec.ts              # Authentication API tests
└── angelswing3/                   # Legacy or version-specific tests
```

**Test Categories:**
- **Frontend Tests**: UI interactions, user workflows, visual testing
- **API Tests**: Backend API endpoints, authentication, data validation
- **Responsive Tests**: Cross-device compatibility, layout adaptation
- **Authentication Setup**: Login state management for test sessions

### 📁 pages/
Page Object Model implementation containing page classes for different application screens.

```
pages/
├── PageManager.ts              # Central page manager and factory
├── HelperBase.ts              # Base helper class for common functions
├── LoginPage.ts               # Login page interactions
├── SignupPage.ts              # User registration page
├── DashboardPage.ts           # Main dashboard functionality
├── ProjectPage.ts             # Project management page
├── CreateProjectPage.ts       # Project creation page
├── UserPage.ts                # User profile and settings
├── MapPage.ts                 # Main map interface
├── TerrainMapPage.ts          # Terrain-specific map features
├── TwoScreenPage.ts           # Dual-screen layout page
├── ThreeDMap.ts               # 3D map visualization
├── TwoDMapPage.ts             # 2D map functionality
├── FourScreenPage.ts          # Quad-screen layout page
├── SliderScreenPage.ts        # Slider interface page
├── MeasurementPage.ts         # Measurement tools and calculations
├── IssuePage.ts               # Issue tracking and management
├── NavigationPage.ts          # Site navigation components
├── ForgotPassword.ts          # Password recovery functionality
├── ResetPassword.ts           # Password reset functionality
└── AdminApprovalPage.ts       # Admin approval workflows
```

**Page Object Benefits:**
- **Maintainability**: Centralized element selectors and actions
- **Reusability**: Shared methods across multiple tests
- **Readability**: Clean test code with meaningful method names
- **Scalability**: Easy to add new pages and extend functionality

### 📁 utils/
Utility functions, constants, and helper modules.

```
utils/
├── endpoints.ts               # API endpoint constants
├── statusCodes.ts            # HTTP status code constants
└── message.ts                # Common message constants and templates
```

**Utility Categories:**
- **API Utilities**: Endpoint URLs, request/response helpers
- **Constants**: Status codes, error messages, configuration values
- **Helpers**: Common functions used across tests

### 📁 services/
External service integrations and API request handlers.

```
services/
├── auth.request.ts           # Authentication service requests
└── mailosaur.request.ts      # Email testing service integration
```

**Service Integrations:**
- **Authentication Service**: Login, logout, token management
- **Email Service**: Email verification and testing via Mailosaur
- **External APIs**: Third-party service integrations

### 📁 test-data/
Test data, fixtures, and configuration files.

```
test-data/
├── signup-test-data.ts       # User registration test data
└── assets/                   # Test files, images, documents
```

**Test Data Types:**
- **User Data**: Test accounts, profiles, credentials
- **Project Data**: Sample projects, configurations
- **File Assets**: Images, documents, test files for upload scenarios

### 📁 Configuration Files

#### `playwright.config.ts`
Main Playwright configuration defining:
- **Test Directory**: `./tests`
- **Timeout Settings**: 120s test timeout, 300s global timeout
- **Browser Projects**: Chromium, mobile devices (Pixel 7, Galaxy Tab S4, iPhone 15 Pro Max, iPad Pro 11)
- **Reporters**: HTML reports, Allure integration
- **Authentication**: Shared login state across tests
- **Screenshots & Videos**: Failure capture and debugging

#### `package.json`
Project metadata and dependencies:
- **Dependencies**: Playwright, TypeScript, Allure, Faker.js, Mailosaur
- **Scripts**: 
  - `test`: Run all tests with authentication
  - `test:frontend`: Frontend-specific tests
  - `test:api`: API-specific tests
  - `test:mapOperations`: Map functionality tests
  - `allure:report`: Generate Allure reports

#### `tsconfig.json`
TypeScript configuration for:
- **Target**: ES2022
- **Module System**: CommonJS
- **Strict Type Checking**: Enabled
- **Path Resolution**: Absolute imports support

#### `test-options.ts`
Custom test fixtures extending Playwright's base test:
- **PageManager**: Centralized page object factory
- **Network State**: Ensures pages are fully loaded
- **Custom Expectations**: Extended assertion capabilities

### 📁 Generated Directories

#### `playwright-report/`
HTML test reports with:
- Test execution results
- Screenshots and videos
- Timeline and traces
- Error details and stack traces

#### `allure-results/` & `allure-report/`
Allure test reporting:
- Detailed test analytics
- Historical trends
- Categorized failures
- Rich attachments and logs

#### `test-results/`
Playwright test artifacts:
- Screenshots on failure
- Video recordings
- Trace files for debugging
- Test metadata and timings

## Key Features & Patterns

### 🎯 Page Object Model (POM)
- **Encapsulation**: UI interactions wrapped in meaningful methods
- **Maintenance**: Single source of truth for element selectors
- **Reusability**: Shared components across multiple test scenarios

### 🔧 Cross-Browser Testing
- **Desktop**: Chromium-based testing
- **Mobile**: iOS (iPhone 15 Pro Max) and Android (Pixel 7) simulation
- **Tablet**: iPad Pro 11 and Galaxy Tab S4 support

### 🔐 Authentication Management
- **Shared State**: Login once, use across all tests
- **Security**: Environment-based credential management
- **Efficiency**: Reduced test execution time

### 📊 Comprehensive Reporting
- **HTML Reports**: Built-in Playwright reporting
- **Allure Integration**: Advanced analytics and historical data
- **Visual Evidence**: Screenshots, videos, and traces

### 🧪 Test Organization
- **Separation of Concerns**: Frontend vs API vs setup tests
- **Parallel Execution**: Optimized for CI/CD pipelines
- **Data-Driven**: External test data and fixtures

## Usage Patterns

### Running Tests
```bash
# All tests with authentication
npm run test

# Frontend tests only
npm run test:frontend

# API tests only  
npm run test:api

# Map-specific tests with reporting
npm run test:mapOperations
```

### Development Workflow
1. **Add Page Objects**: Create new page classes in `/pages`
2. **Write Tests**: Add test specs in appropriate `/tests` subdirectory
3. **Manage Data**: Store test data in `/test-data`
4. **Utilities**: Add common functions to `/utils`
5. **Services**: Integrate external APIs in `/services`

### Best Practices
- **Page Object First**: Always create page objects before writing tests
- **Data Externalization**: Keep test data separate from test logic
- **Meaningful Names**: Use descriptive test and method names
- **Error Handling**: Implement robust error handling and retry logic
- **Documentation**: Comment complex test scenarios and page interactions

## Technology Stack

- **Test Framework**: Playwright
- **Language**: TypeScript
- **Pattern**: Page Object Model
- **Reporting**: HTML + Allure
- **CI/CD Ready**: Parallel execution, retry logic
- **Cross-Platform**: Desktop, mobile, tablet support

This structure ensures scalability, maintainability, and comprehensive test coverage for the Angelswing application across multiple platforms and browsers. 
