# Just Another Webshop

Just Another Webshop is a e-commerce platform built with Angular and Supabase. It features product listings, search and filter, pagination, shopping cart, wishlist, authentication, contact form and a responsive design based on a Figma prototype.

## 🎨 Design

A Figma prototype was used as the base for the UI.

### Home
<img width="832" height="426" alt="figma_home_desktop" src="https://github.com/user-attachments/assets/565f46ba-fbe7-48e4-9a84-71fac38af853" />

### Collection
<img width="832" height="490" alt="figma_collection" src="https://github.com/user-attachments/assets/3b4b311d-d500-45b3-81b2-bd808376020d" />

### Shopping Cart
<img width="832" height="491" alt="figma_shopping_cart" src="https://github.com/user-attachments/assets/6755da4a-566c-457d-bee2-2f27e17d24a2" />

---

## 🎨 Color Palette

The project uses a modern, earthy color palette with neutral backgrounds and accent colors for highlights and actions.

<img width="447" height="377" alt="colorpalette" src="https://github.com/user-attachments/assets/dbd0762e-f690-49a9-b1c9-32c077c722d1" />

## ✨ Features

- Product listing and product details
- Filtering in modal (category, brand, tag, price)  
- Search witn query parameters in the URL (name, category, brand) (e.g. `products?search=dress`)
- Pagination
- Wishlist
  - localStorage for guests
  - Supabase for logged-in users
- Shopping cart
  - localStorage for guests
  - Supabase for logged-in users
  - Simulated checkout: Stock is reduced in `Jaw Products` table on purchase
- Authentication (Supabase Auth)
  - Profile update: Logged-in users can update first name, last name, and phone number
- Contact form (EmailJS)
- Responsive design (desktop, tablet, mobile)

---

## 🛠️ Tech Stack

- Angular 21
- Supabase (PostgreSQL, Auth, RLS)
- Tailwind CSS
- Figma

---

## 📁 File Structure
```
just-another-webshop/
├── angular.json
├── package.json
├── tsconfig.json
├── src/
│   ├── main.ts
│   ├── index.html
│   ├── styles.css
│   └── app/
│       ├── components/
│       ├── pages/
│       └── services/
└── README.md
```

## 🗄️ Backend

Supabase is used for authentication and data storage.  

### Tables

- `products` – product data
- `shopping_cart_items` – cart items per user
- `wishlist_items` – wishlist per user
- `profiles` – user info

Row-level security (RLS) is enabled.

### 📊 Database Structure
<img width="525" height="460" alt="database" src="https://github.com/user-attachments/assets/16ac8b2c-7195-4d17-b518-331d1f301d8c" />

---

## 🖥️ Screenshots from the App

### Home
<img width="600" alt="home_desktop" src="https://github.com/user-attachments/assets/e5e16b40-913a-494b-8fb5-49af5afdfbdc" />

### Collection
<img width="600" alt="collection_desktop" src="https://github.com/user-attachments/assets/0c038618-09af-49fc-830e-32a6367ae127" />

### Collection with search and filter
<img width="600" alt="collection_filter_desktop" src="https://github.com/user-attachments/assets/84b57e03-e2fb-4d98-9d5a-c2785eab27a9" />

### Shopping Cart
<img width="600" alt="shopping_cart_desktop" src="https://github.com/user-attachments/assets/e44e3c29-5505-4039-b0d4-bb498a040f0a" />

---

## 📱 Responsive views from the App

### Collection with search and filter
<img width="200" alt="collection_filter_mobile" src="https://github.com/user-attachments/assets/437723e5-58b4-443d-9efd-5718e85953b0" />

### Shopping Cart
<img width="200" alt="shopping_cart_mobile" src="https://github.com/user-attachments/assets/2b9237a6-a508-4b75-b1c2-3b63acfdb669" />

---

## 🚧 Development Sprints

### Sprint 1 – Foundation & Products
- Set up Angular project and routing
- Integrate Supabase (database + auth)
- Product listing (`Jaw Products`)
- Product detail page
- Basic responsive layout (Tailwind)

---

### Sprint 2 – Filtering & User Features
- Filtering (category, brand, tag, price)
- Search (name, category, brand)
- Wishlist (`wishlist_items`)
- Authentication (Supabase Auth, `profiles`)
- UI improvements based on Figma
  
---

### Sprint 3 – Shopping Flow & Persistence
- Shopping cart (`shopping_cart_items`): The `checkout_cart` function updates or removes products (`stock`) for the logged-in user during checkout.
- Contact form (EmailJS)
- Modal for filtering products
- Final responsive design

## 📖 Retrospective

After completing the main sprints, here are some reflections on the project and process:

### 🌟 Six things that went well
1. Collaboration, communication, and solution-oriented teamwork within the group.
2. Successfully connecting Supabase to Angular.
3. Search with query parameters and filtering in modals.
4. Consistent UI that closely follows the Figma prototype.
5. Authentication with persistence for wishlist and cart – and stock updates in Supabase when a logged-in user clicks Proceed to Checkout (item quantity decreases).
6. Contact form.

### 🔧 Four things that can be improved
1. Stripe integration for real payment simulation (requires a backend server, e.g. Express, to handle secure payment processing).
2. Advanced user management (like deleting users) requires a backend (e.g., Express) to securely use the Supabase Admin API, since it needs the service role key and must not be called from the frontend.
3. More time for accessibility improvements.
4. Deploy the application for public access.

---

## ⚙️ Development

This project was generated using Angular CLI version 21.2.3.

### 🚀 Start dev server

```bash
ng serve

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## 🔑 Supabase Setup

To run this project locally, you need your own Supabase project and API keys.

1. Create a project at [Supabase](https://app.supabase.com/).
2. In the Supabase dashboard, create the required tables (`products`, `shopping_cart_items`, `wishlist_items`, `profiles`) and set up Row Level Security (RLS) as described in the backend section.
3. Copy your Supabase project URL and anon/public API key.
4. Add your credentials to the environment file:

Example:
```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-anon-or-service-role-key'};

