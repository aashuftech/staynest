# StayNest

StayNest is an AI-powered real estate platform where users can find properties for rent or purchase, list their own properties, manage bookings, and get instant guidance through an AI chatbot. The platform provides separate experiences for guests, users, and administrators.

## Features

- Browse verified properties for **rent** and **buy**.
- Search properties using normal filters such as location, price, property type, bedrooms, and bathrooms.
- AI-powered property search where users can write requirements in Hindi, English, or Hinglish.
- AI chatbot available across the website for property, booking, listing, and account guidance.
- User authentication, profile management, and profile image upload.
- List a property for rent or sale with images uploaded directly from the device.
- Property listing approval workflow for administrators.
- Property requests where users can submit their exact requirement to admins.
- Booking management with booking status and payment details.
- User dashboard for bookings, messages, profile, payments, and property-related activity.
- Admin dashboard to manage properties, listing requests, property requests, bookings, and users.
- Admin can ban or unban users and review individual user AI search and chat activity.
- AI conversations and AI property searches are stored in MongoDB for activity tracking.
- Unique user IDs such as `#1`, `#2`, and `#3` for easier admin-side user identification.
- Responsive interface for desktop, tablet, and mobile devices.

## How AI property search works

1. A user enters a natural-language requirement, for example:

   ```text
   Mujhe Noida me 2 BHK rent par chahiye, budget 25,000 tak hai.
2. The application sends the request to the AI service along with relevant available property information.
3. The AI understands requirements such as location, rent/buy intent, budget, bedrooms, amenities, and property type.
4. The system returns suitable property results and a helpful explanation in the user's preferred language.
5. The search request, result count, and AI response are saved in the database for user history and admin AI analytics.
AI search improves discovery, but users should still verify property details, pricing, availability, and ownership before making a booking or payment.
How the AI chatbot works
1. A user opens Chat with AI from any page.
2. The chatbot receives the user's question along with StayNest-related guidance, such as how to search, book, list a property, manage a profile, or contact support.
3. The AI detects whether the user is writing in Hindi, English, or Hinglish and responds in a suitable language.
4. The user's message and the AI response are stored together in one conversation record for that user.
5. Admins can review user AI activity from the User Activities section without losing chat history when the user clears the visible chat box.
The chatbot provides platform guidance and property discovery help. It does not make legal, financial, ownership, or payment decisions for users.
How property listing works
1. A user opens List Your Property.
2. The user selects whether the property is for rent or sale.
3. The user enters property details such as title, location, price, bedrooms, bathrooms, description, and amenities.
4. Property images are uploaded directly from the user's device.
5. The listing is submitted for admin review.
6. After approval, the property becomes visible to users on the property browsing pages.
How booking management works
1. A user opens a property and selects booking dates or booking options.
2. The booking information is saved against the selected property and the logged-in user.
3. The user can view their own bookings from the dashboard.
4. Admins can view all bookings, including property details, guest details, status, and payment information.
5. Users can manage or cancel bookings where the application allows it.
User roles
Guest
- Browse public pages and properties.
- View property details.
- Use public AI guidance where available.
- Must sign in to access user-only features.
User
- Manage profile and profile image.
- Search, book, and request properties.
- Submit properties for rent or sale.
- View personal bookings, activity, AI searches, and chats.
- Use the AI chatbot and AI property search.
Admin
- Manage all users, properties, bookings, and requests.
- Approve or reject property listings.
- Ban or unban user accounts.
- View user AI activity and search history.
- Monitor AI search performance and conversation activity.
Built With
- Next.js — builds pages, API routes, and full-stack application features.
- React — creates interactive user interfaces and reusable components.
- TypeScript — adds safer types for frontend and backend code.
- Tailwind CSS — styles the responsive interface.
- MongoDB — stores users, properties, bookings, requests, AI chats, and AI activity.
- Mongoose — manages MongoDB models and database queries.
- NextAuth — handles authentication and user sessions.
- Groq API — powers the AI chatbot and AI property search.
- Cloud image storage — stores uploaded profile and property images.
Project Structure
staynest/
├── app/
│   ├── admin/          Admin pages and management screens
│   ├── apartments/     Property browsing and search pages
│   ├── dashboard/      User dashboard pages
│   ├── api/            Backend API routes
│   └── auth/           Authentication pages
│
├── components/
│   ├── ai/             AI chatbot and AI search components
│   ├── dashboard/      Dashboard components
│   ├── layout/         Navbar, footer, and shared layout
│   └── auth/           Authentication components
│
├── lib/                Database, authentication, AI, and helper functions
├── models/             MongoDB models
├── public/             Static assets
├── types/              TypeScript types
└── middleware.ts       Route protection and access control
Run Locally
You will need Node.js, npm, a MongoDB database, and a Groq API key.
1. Clone the repository
git clone YOUR_GITHUB_REPOSITORY_URL
cd staynest
2. Install dependencies
npm install
3. Configure environment variables
Create a .env file in the project root and add your values:
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key
Add image-storage environment variables if your project uses Cloudinary, Azure Blob Storage, or another image provider.
Never upload .env files, API keys, or database credentials to GitHub.
4. Start the development server
npm run dev
Open:
http://localhost:3000
Security and privacy
- Authentication protects user and admin-only pages.
- Role-based access prevents regular users from accessing admin operations.
- Banned users cannot log in or continue using an active session.
- API routes should validate input before saving data.
- Groq API keys and database credentials remain on the server through environment variables.
- Users can only access their own booking, profile, search, and chat data.
- Admin actions such as banning users and deleting history should be protected by admin authorization.
Known limitations
- AI responses depend on the available property data and prompt quality.
- AI property suggestions do not guarantee availability or ownership verification.
- Property pricing, availability, and booking details should always be confirmed by users.
- Add verified screenshots, live demo links, and final deployment instructions before presenting the project as a production-ready platform.
