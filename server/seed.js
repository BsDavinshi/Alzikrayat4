require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const User = require('./models/User');
const Album = require('./models/Album');
const Photo = require('./models/Photo');
const Comment = require('./models/Comment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/alzikrayat';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB for seeding...');

  const seedImagesDir = path.join(__dirname, 'seed-images');
  const uploadsDir = path.join(__dirname, 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });

  const imageFiles = fs
    .readdirSync(seedImagesDir)
    .filter((f) => f.endsWith('.png'))
    .sort();

  for (const file of imageFiles) {
    fs.copyFileSync(path.join(seedImagesDir, file), path.join(uploadsDir, file));
  }

  await Promise.all([
    Comment.deleteMany({}),
    Photo.deleteMany({}),
    Album.deleteMany({}),
    User.deleteMany({})
  ]);

  const passwordHash = await bcrypt.hash('Password123', 10);

  const [sara, ahmed, mona, yousif] = await User.create([
    {
      firstName: 'Sara',
      lastName: 'Hassan',
      email: 'sara@alzikrayat.test',
      password: passwordHash,
      location: 'Khartoum',
      occupation: 'Photographer',
      description: 'Capturing golden hour along the Nile and quiet corners of the city.'
    },
    {
      firstName: 'Ahmed',
      lastName: 'Omer',
      email: 'ahmed@alzikrayat.test',
      password: passwordHash,
      location: 'Omdurman',
      occupation: 'Software Engineer',
      description: 'Building things for the web and collecting street photography on weekends.'
    },
    {
      firstName: 'Mona',
      lastName: 'Khalid',
      email: 'mona@alzikrayat.test',
      password: passwordHash,
      location: 'Port Sudan',
      occupation: 'Architect',
      description: 'Light, shadow, texture and coastal mornings.'
    },
    {
      firstName: 'Yousif',
      lastName: 'Ibrahim',
      email: 'yousif@alzikrayat.test',
      password: passwordHash,
      location: 'Wad Madani',
      occupation: 'CS Student',
      description: 'Documenting campus life and late-night coffee with friends.'
    }
  ]);

  const [nileAlbum, campusAlbum, coastAlbum] = await Album.create([
    {
      userId: sara._id,
      title: 'Golden Hour on the Nile',
      description: 'Warm evenings where the Blue and White Nile meet.'
    },
    {
      userId: yousif._id,
      title: 'SUST Campus Memories',
      description: 'Snapshots from lectures, study groups and graduation prep.'
    },
    {
      userId: mona._id,
      title: 'Red Sea Mornings',
      description: 'Early light, salt air and quiet harbours.'
    }
  ]);

  const photoMeta = [
    { user: sara, album: nileAlbum, title: 'Sunset over Tuti Bridge', description: 'The sky turned deep amber right after the ferry docked.', filterName: 'warm', tags: [ahmed._id, mona._id], likes: [ahmed._id, mona._id, yousif._id] },
    { user: ahmed, album: nileAlbum, title: 'Morning Tea by the River', description: 'Mint tea and warm breeze before the city wakes up.', filterName: 'vintage', tags: [sara._id], likes: [sara._id, yousif._id] },
    { user: mona, album: coastAlbum, title: 'Harbour Reflections', description: 'Still water mirroring the morning boats.', filterName: 'cool', tags: [sara._id], likes: [sara._id, ahmed._id, yousif._id] },
    { user: yousif, album: campusAlbum, title: 'Late Night Study Session', description: 'Debugging code and sharing stories before finals.', filterName: 'noir', tags: [ahmed._id], likes: [sara._id, ahmed._id] },
    { user: sara, album: nileAlbum, title: 'Palm Silhouettes', description: 'Caught this just minutes before dusk.', filterName: 'sepia', tags: [yousif._id], likes: [mona._id, ahmed._id] },
    { user: mona, album: coastAlbum, title: 'Coral Horizon', description: 'Soft pastel clouds stretching across the sea.', filterName: 'none', tags: [], likes: [sara._id, ahmed._id] },
    { user: ahmed, album: campusAlbum, title: 'Courtyard Shadows', description: 'Afternoon sunlight cutting across the arches.', filterName: 'sharpen', tags: [yousif._id], likes: [mona._id] },
    { user: yousif, album: campusAlbum, title: 'Coffee & Notebooks', description: 'Fuel for the Advanced Web Technologies project.', filterName: 'warm', tags: [sara._id, mona._id], likes: [sara._id, mona._id, ahmed._id] },
    { user: sara, album: nileAlbum, title: 'Lanterns at Dusk', description: 'Warm street lights coming alive along the corniche.', filterName: 'vignette', tags: [], likes: [yousif._id] },
    { user: mona, album: coastAlbum, title: 'Weathered Wood & Rope', description: 'Small textures from the old pier.', filterName: 'grayscale', tags: [ahmed._id], likes: [sara._id] },
    { user: ahmed, album: null, title: 'Rain After the Dust', description: 'Fresh air and shimmering streets after the first shower.', filterName: 'cool', tags: [], likes: [sara._id, mona._id] },
    { user: yousif, album: campusAlbum, title: 'Friends on the Steps', description: 'One of those afternoons you wish never ended.', filterName: 'vintage', tags: [sara._id, ahmed._id, mona._id], likes: [sara._id, ahmed._id, mona._id] }
  ];

  const now = Date.now();
  const createdPhotos = [];
  for (let i = 0; i < Math.min(imageFiles.length, photoMeta.length); i++) {
    const m = photoMeta[i];
    const doc = await Photo.create({
      userId: m.user._id,
      albumId: m.album ? m.album._id : null,
      fileName: imageFiles[i],
      title: m.title,
      description: m.description,
      filterName: m.filterName,
      taggedUsers: m.tags,
      likes: m.likes,
      dateTime: new Date(now - (photoMeta.length - i) * 3600 * 1000 * 12)
    });
    createdPhotos.push(doc);
  }

  if (createdPhotos.length >= 3) {
    await Comment.create([
      { photoId: createdPhotos[0]._id, userId: ahmed._id, comment: 'That amber glow on the water is unreal!' },
      { photoId: createdPhotos[0]._id, userId: mona._id, comment: 'One of my favourite evenings this year.' },
      { photoId: createdPhotos[1]._id, userId: sara._id, comment: 'Nothing beats morning tea by the Nile.' },
      { photoId: createdPhotos[2]._id, userId: yousif._id, comment: 'Such calm colours — feels like a painting.' }
    ]);
  }

  console.log(`Seeded 4 users, 3 albums, ${createdPhotos.length} photos, and sample comments.`);
  console.log('Demo login: sara@alzikrayat.test / Password123');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
