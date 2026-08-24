import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Support both process.env and direct env
const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  console.error(' MONGODB_URI not set!')
  console.log('Run: MONGODB_URI="your-uri" npm run seed')
  process.exit(1)
}

const properties = [
  { title:'Modern Downtown Toronto Flat', description:'Beautiful modern flat in the heart of downtown Toronto. Stunning city views, fully furnished with high-end appliances. Walking distance to transit, restaurants, and entertainment.', type:'FLAT', city:'Toronto', neighborhood:'Downtown', address:'120 King St W, Toronto, ON, Canada', latitude:43.6480, longitude:-79.3832, pricePerNight:280, pricePerMonth:3200, bedrooms:1, bathrooms:1, area:650, maxGuests:2, images:['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'], amenities:['WiFi','Kitchen','Gym','Parking','Air Conditioning'], isVerified:true, rating:4.8, reviewCount:24 },
  { title:'Cozy Seattle Craftsman House', description:'Charming craftsman house in quiet Seattle neighborhood. Spacious backyard, modern kitchen. Perfect for families or groups.', type:'HOUSE', city:'Seattle', neighborhood:'Capitol Hill', address:'456 Pine St, Seattle, WA, USA', latitude:47.6062, longitude:-122.3321, pricePerNight:530, pricePerMonth:5800, bedrooms:3, bathrooms:2, area:1800, maxGuests:6, images:['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800','https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'], amenities:['WiFi','Kitchen','Parking','Pet-Friendly','Fireplace'], isVerified:true, rating:4.9, reviewCount:18 },
  { title:'Miami Beach Luxury Condo', description:'Stunning beachfront condo with ocean views. Pool access, just steps from the sand. Perfect for vacations.', type:'CONDO', city:'Miami', neighborhood:'South Beach', address:'789 Ocean Drive, Miami, FL, USA', latitude:25.7617, longitude:-80.1918, pricePerNight:260, pricePerMonth:2800, bedrooms:2, bathrooms:2, area:1100, maxGuests:4, images:['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'], amenities:['WiFi','Pool','Ocean View','Gym','Beach Access'], isVerified:true, rating:4.7, reviewCount:42 },
  { title:'Denver LoDo Brick Townhouse', description:'Historic brick townhouse in Denver vibrant LoDo neighborhood. Walking distance to Union Station.', type:'TOWNHOUSE', city:'Denver', neighborhood:'LoDo', address:'234 Blake St, Denver, CO, USA', latitude:39.7538, longitude:-104.9997, pricePerNight:530, pricePerMonth:4500, bedrooms:2, bathrooms:2, area:1400, maxGuests:5, images:['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'], amenities:['WiFi','Kitchen','Parking','Mountain Views'], isVerified:true, rating:4.6, reviewCount:31 },
  { title:'NYC Midtown Studio Apartment', description:'Efficient and stylish studio in the heart of Manhattan. Everything you need in a compact space. Perfect for exploring the city.', type:'STUDIO', city:'New York', neighborhood:'Midtown', address:'350 5th Ave, New York, NY, USA', latitude:40.7484, longitude:-73.9967, pricePerNight:290, pricePerMonth:3500, bedrooms:0, bathrooms:1, area:400, maxGuests:2, images:['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'], amenities:['WiFi','Kitchen','City View','Near Subway'], isVerified:true, rating:4.5, reviewCount:67 },
  { title:'San Francisco Mission Flat', description:'Bright and airy flat in SF vibrant Mission District. Designer furniture, chef kitchen, private balcony.', type:'FLAT', city:'San Francisco', neighborhood:'Mission District', address:'567 Valencia St, San Francisco, CA, USA', latitude:37.7749, longitude:-122.4194, pricePerNight:320, pricePerMonth:4200, bedrooms:2, bathrooms:1, area:900, maxGuests:4, images:['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'], amenities:['WiFi','Kitchen','Balcony','Laundry','Pet-Friendly'], isVerified:true, rating:4.8, reviewCount:29 },
  { title:'London Mayfair Elegant Flat', description:'Elegant flat in the heart of London. Victorian building with modern interiors. Near Hyde Park and Oxford Street.', type:'FLAT', city:'London', neighborhood:'Mayfair', address:'45 Park Lane, London, UK', latitude:51.5074, longitude:-0.1278, pricePerNight:380, pricePerMonth:4800, bedrooms:2, bathrooms:2, area:1000, maxGuests:4, images:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], amenities:['WiFi','Kitchen','Concierge','Gym','Air Conditioning'], isVerified:true, rating:4.9, reviewCount:53 },
  { title:'Mumbai Bandra Sea View Apartment', description:'Premium apartment in upscale Bandra area with sea views. Perfect for business travelers and long stays.', type:'FLAT', city:'Mumbai', neighborhood:'Bandra', address:'12 Bandstand Promenade, Mumbai, India', latitude:19.0544, longitude:72.8230, pricePerNight:180, pricePerMonth:2500, bedrooms:3, bathrooms:2, area:1500, maxGuests:6, images:['https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800'], amenities:['WiFi','Pool','Gym','Sea View','Security','Parking'], isVerified:true, rating:4.7, reviewCount:38 },
  { title:'Dubai Marina Luxury Villa', description:'Stunning luxury villa in Dubai Marina with private pool and panoramic skyline views. World-class amenities.', type:'VILLA', city:'Dubai', neighborhood:'Dubai Marina', address:'Dubai Marina Walk, Dubai, UAE', latitude:25.0804, longitude:55.1403, pricePerNight:650, pricePerMonth:8000, bedrooms:4, bathrooms:3, area:3000, maxGuests:8, images:['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'], amenities:['WiFi','Pool','Gym','Sea View','Security','Parking','Concierge','Air Conditioning'], isVerified:true, rating:5.0, reviewCount:19 },
  { title:'Sydney Bondi Beach Studio', description:'Charming studio 2 minutes from famous Bondi Beach. Ocean breeze and natural light throughout.', type:'STUDIO', city:'Sydney', neighborhood:'Bondi Beach', address:'88 Campbell Parade, Sydney, Australia', latitude:-33.8914, longitude:151.2767, pricePerNight:220, pricePerMonth:2800, bedrooms:0, bathrooms:1, area:450, maxGuests:2, images:['https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800'], amenities:['WiFi','Kitchen','Beach Access','Air Conditioning','Balcony'], isVerified:true, rating:4.6, reviewCount:44 },
]

async function seed() {
  console.log('🔗 Connecting to MongoDB...')
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Connected!')

  await mongoose.connection.collection('users').deleteMany({})
  await mongoose.connection.collection('properties').deleteMany({})
  await mongoose.connection.collection('bookings').deleteMany({})
  console.log('🧹 Cleared existing data')

  const adminPw = await bcrypt.hash('admin123', 10)
  await mongoose.connection.collection('users').insertOne({ name:'Admin User', email:'admin@staynest.com', password:adminPw, role:'ADMIN', createdAt:new Date(), updatedAt:new Date() })
  console.log('✅ Admin: admin@staynest.com / admin123')

  const userPw = await bcrypt.hash('user123', 10)
  await mongoose.connection.collection('users').insertOne({ name:'John Doe', email:'user@staynest.com', password:userPw, role:'USER', createdAt:new Date(), updatedAt:new Date() })
  console.log('✅ User: user@staynest.com / user123')

  await mongoose.connection.collection('properties').insertMany(
    properties.map(({ pricePerNight, ...property }) => ({ ...property, isAvailable: true, createdAt:new Date(), updatedAt:new Date() }))
  )
  console.log('✅ 10 properties inserted')

  await mongoose.disconnect()
  console.log('\n🎉 Seeding complete! Run: npm run dev')
}

seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1) })
