const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const Testimonial = require('./models/Testimonial');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected DB');

  // Create a beautiful premium testimonial
  const t1 = new Testimonial({
    clientName: "Sundar Pichai",
    designation: "CEO, Google",
    description: "The strategic insights and cutting-edge solutions provided by TIIS completely transformed our approach to multidisciplinary challenges. A truly exceptional team to partner with.",
    rating: 5,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
  });

  const t2 = new Testimonial({
    clientName: "Satya Nadella",
    designation: "CEO, Microsoft",
    description: "TIIS goes above and beyond standard consultancy. Their ability to fuse innovative technologies with reliable corporate strategy is unmatched in the industry.",
    rating: 5,
    isActive: true,
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
  });

  await Testimonial.deleteMany({});
  await t1.save();
  await t2.save();
  console.log('Testimonials seeded successfully!');
  mongoose.disconnect();
}

seed().catch(err => console.error(err));
