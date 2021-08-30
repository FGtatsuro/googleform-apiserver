# googleform-apiserver
API server for components of Google form

## Setup

1. Make Google Apps Script API enabled via https://script.google.com/home/usersettings

2. Setup Clasp CLI.

   ```bash
   $ npm install
   $ npx clasp login
   ```

3. Setup Google Apps Script project.

   If you don't have a project, please create it as follows.

   ```bash
   $ npx clasp create --type webapp --title "API server for components of Google form"
   ```

   If you have an existing project, please clone it as follows.

   ```bash
   $ npx clasp clone <YOUR PROJECT(SCRIPT) ID>
   ```
