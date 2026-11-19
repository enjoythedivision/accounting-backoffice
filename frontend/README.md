# Frontend

Run commands from this folder:

```bash
npm run dev
npm run lint
npm test
npm run build
```

## Folder structure

```text
src/
  main.jsx                 Starts React
  app/                     App shell, routes, and app layout styles
  api/config.js            Backend URL
  assets/                  Fonts and other static files
  components/layout/       Layout components shared by the app
  features/
    customers/
      api/                 Requests for customers, notes, and payments
      components/          PaymentCard and PaymentGrid, with their styles
      pages/               Customer screens, with page-specific styles
    dashboard/
      pages/               Dashboard screen and styles
  styles/global.scss       Global typography, colors, and shared styles
tests/                     API request tests
```

Keep a component's stylesheet beside the component. Put components used only by
one feature inside that feature. Put shared layout components in
`components/layout`.

## API calls

Pages call named functions instead of writing `fetch` directly:

```js
import { getCustomer } from "../api/customersApi.js";

const customer = await getCustomer(id);
```

The flow is **page → API function → backend**.

Each API function follows the same steps:

1. Call `fetch` with the URL and any data to send.
2. Check `response.ok`. Throw an error if the request failed.
3. Return `response.json()` if the endpoint returns data.

Archive, restore, and delete-note requests return no data, so they skip step 3.
The page catches errors and shows a message. All requests use
`credentials: "include"` to send the login cookie.

The `fetch` calls are written out in each function so you can read one function
and see the complete request. `api/config.js` only stores the backend URL.

The dashboard currently gets its customer data through `customersApi.js` and
continues to calculate its displayed totals in React.

## Backend URL

The default API URL is `http://localhost:5021/api`. To change it, copy
`.env.example` to `.env.local`, set `VITE_API_BASE_URL`, and restart Vite. Include
`/api` in the value, without a trailing slash. For a deployment serving the API on the same origin, the
value can be `/api`.

The API URL is public configuration. Keep passwords and server secrets out of
frontend environment variables.

The backend now requires authentication. This refactor sends existing cookies;
the React login screen still needs to be implemented.
