# StayNest

StayNest is an AI-powered real estate platform where users can discover properties for rent or purchase, list their own property, manage bookings, and receive instant help through AI.

The platform supports guest, user, and admin roles with separate access and management features.

## Screenshots and Demo

Add your verified screenshots and deployment links here.

- **Live Demo:** Add deployed URL
- **GitHub Repository:** Add GitHub repository URL

## Features

- Browse verified properties for rent and purchase.
- Search properties by location, budget, bedrooms, bathrooms, property type, and amenities.
- AI-powered property search using normal Hindi, English, or Hinglish prompts.
- AI chatbot available across the application.
- User signup, login, profile management, and profile image upload.
- Property owners can list properties for rent or sale.
- Upload property images directly from a device.
- Admin approval workflow for submitted property listings.
- Users can send custom property requests to the admin.
- Booking and payment status management.
- User dashboard for profile, bookings, payments, messages, and property activity.
- Admin dashboard for managing users, properties, bookings, listing requests, and property requests.
- Admin can ban or unban users.
- Admin can view individual user search history and AI chat activity.
- AI searches and conversations are stored in MongoDB.
- Each user receives a permanent unique user ID such as `#1`, `#2`, or `#3`.
- Responsive design for desktop, tablet, and mobile devices.

## How AI Property Search Works

1. A user writes their requirement in natural language.

   **Example:**

   ```text
   Mujhe Noida me 2 BHK rent par chahiye, budget 25,000 tak hai.
   ```

2. The application sends the search request to the AI service with relevant property information.

3. The AI identifies important details such as location, budget, rent or buy intent, bedrooms, bathrooms, property type, and amenities.

4. The application finds suitable published properties based on the extracted requirements.

5. The AI returns a helpful answer in Hindi, English, or Hinglish according to the user's language.

6. The search prompt, AI response, and result count are saved in MongoDB for user history and admin analytics.

> AI search helps users discover relevant properties. Users should still verify property details, pricing, availability, and ownership before making a booking or payment.

## How the AI Chatbot Works

1. A user opens the **Chat with AI** button from any page.

2. The user can ask questions about properties, booking, listing a property, payments, account access, dashboard options, or StayNest features.

3. The chatbot receives the question along with StayNest platform guidance.

4. The AI detects whether the user is writing in Hindi, English, or Hinglish.

5. The chatbot responds in the same suitable language.

6. User messages and AI replies are stored together in the user's AI conversation history.

7. Clearing chat only removes messages from the visible chat box. The saved database history remains available for admin activity review.

> The chatbot provides StayNest guidance and property discovery support. It does not make legal, financial, ownership, or payment decisions for users.

## How Property Listing Works

1. A user opens **List Your Property**.

2. The user selects whether the property is for rent or sale.

3. The user enters details such as title, location, price, bedrooms, bathrooms, description, and amenities.

4. The user uploads property images directly from their device.

5. The listing is submitted for admin review.

6. The admin can approve or reject the request.

7. After approval, the property becomes visible in property browsing and AI search results.

## How Booking Management Works

1. A user opens a property and submits a booking request.

2. The booking is saved with the selected property and logged-in user details.

3. The user can view their own bookings from the dashboard.

4. The admin can view all bookings with property details, guest details, booking status, and payment status.

5. Users can cancel bookings where cancellation is enabled.

## User Roles

### Guest

- Browse public pages and available properties.
- View property details.
- Use public features where available.
- Must sign in to book a property, submit a listing, or access the dashboard.

### User

- Manage profile and profile image.
- Search properties and submit property requests.
- Book properties and view booking history.
- Submit properties for rent or sale.
- Access saved AI searches and AI chat history.
- Use the AI chatbot and AI property search.

### Admin

- Manage all users, properties, bookings, and requests.
- Approve or reject submitted property listings.
- Ban or unban user accounts.
- View user AI search history and chatbot activity.
- Monitor AI search performance and conversation activity.
- Manage property requests and booking details.

## Built With

- **Next.js** — full-stack pages, routes, and API endpoints.
- **React** — interactive UI and reusable components.
- **TypeScript** — type-safe frontend and backend development.
- **Tailwind CSS** — responsive UI styling.
- **MongoDB** — stores users, properties, bookings, requests, and AI data.
- **Mongoose** — manages MongoDB models and queries.
- **NextAuth** — handles authentication and user sessions.
- **Groq API** — powers AI property search and the AI chatbot.
- **Image Storage Service** — stores uploaded profile and property images.

## Project Structure

```text
staynest/
├── app/
│   ├── admin/          Admin dashboard and management pages
│   ├── apartments/     Property browsing and search pages
│   ├── dashboard/      User dashboard pages
│   ├── api/            Backend API routes
│   └── auth/           Login and signup pages
│
├── components/
│   ├── ai/             AI chatbot and AI search components
│   ├── auth/           Authentication-related components
│   ├── dashboard/      User dashboard components
│   └── layout/         Navbar, footer, and shared layout
│
├── lib/                Database, authentication, AI, and helper functions
├── models/             MongoDB database models
├── public/             Static images and assets
├── types/              TypeScript type definitions
└── middleware.ts       Route protection and access control
```

## Run Locally

You need Node.js, npm, MongoDB, and a Groq API key.

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd staynest
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key
```

Add image-storage variables if your project requires them.

### 4. Start the Development Server

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:3000
```

## Security and Privacy

- Authentication protects user-only and admin-only routes.
- Role-based access prevents normal users from opening admin pages.
- Banned users cannot log in or continue using an active account session.
- Users can only access their own profile, booking, search, and chat data.
- Admin actions are protected by admin authorization.
- API keys and database credentials are stored in environment variables.
- User input should be validated before it is saved in the database.
- Image uploads should be validated for file type and size.

## Known Limitations

- AI suggestions depend on the available property data and user prompt quality.
- AI results do not guarantee property availability, ownership, or final price.
- Users should confirm all property and booking information before payment.
- Add verified screenshots, deployment links, and final setup details before presenting the project as production-ready.
