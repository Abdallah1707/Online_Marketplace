const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const config = require('./config');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Rating = require('./models/Rating');
const Comment = require('./models/Comment');
const OrderComment = require('./models/OrderComment');
const Flag = require('./models/Flag');
const Cart = require('./models/Cart');

// Connect to database
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

async function seedDatabase() {
  try {
    console.log('🗑️  Clearing existing data...');
    
    // Clear all collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Rating.deleteMany({});
    await Comment.deleteMany({});
    await OrderComment.deleteMany({});
    await Flag.deleteMany({});
    await Cart.deleteMany({});
    
    console.log('✅ Existing data cleared');
    
    // ==================== CREATE USERS ====================
    console.log('👥 Creating users...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const sellers = await User.insertMany([
      {
        name: 'TechStore',
        email: 'seller1@test.com',
        password: hashedPassword,
        role: 'seller'
      },
      {
        name: 'FashionHub',
        email: 'seller2@test.com',
        password: hashedPassword,
        role: 'seller'
      },
      {
        name: 'HomeGoods',
        email: 'seller3@test.com',
        password: hashedPassword,
        role: 'seller'
      }
    ]);
    
    const buyers = await User.insertMany([
      {
        name: 'John Doe',
        email: 'buyer1@test.com',
        password: hashedPassword,
        role: 'buyer'
      },
      {
        name: 'Jane Smith',
        email: 'buyer2@test.com',
        password: hashedPassword,
        role: 'buyer'
      },
      {
        name: 'Mike Johnson',
        email: 'buyer3@test.com',
        password: hashedPassword,
        role: 'buyer'
      }
    ]);
    
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    console.log(`✅ Created ${sellers.length} sellers, ${buyers.length} buyers, and 1 admin`);
    
    // ==================== CREATE CATEGORIES ====================
    console.log('📁 Creating categories...');
    
    const categories = await Category.insertMany([
      {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        owner: sellers[0]._id
      },
      {
        name: 'Fashion',
        description: 'Clothing, shoes, and accessories',
        owner: sellers[1]._id
      },
      {
        name: 'Home & Garden',
        description: 'Home decor and garden supplies',
        owner: sellers[2]._id
      },
      {
        name: 'Books',
        description: 'Books and educational materials',
        owner: sellers[0]._id
      },
      {
        name: 'Sports & Outdoors',
        description: 'Sports equipment and outdoor gear',
        owner: sellers[1]._id
      },
      {
        name: 'Toys & Games',
        description: 'Toys, games, and hobbies',
        owner: sellers[2]._id
      }
    ]);
    
    console.log(`✅ Created ${categories.length} categories`);
    
    // ==================== CREATE PRODUCTS ====================
    console.log('📦 Creating products...');
    
    const products = await Product.insertMany([
      // Electronics (Seller 1)
      {
        title: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
        deliveryDays: 2,
        seller: sellers[0]._id,
        category: categories[0]._id
      },
      {
        title: 'Smart Watch Pro',
        description: 'Feature-rich smartwatch with health tracking',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80',
        deliveryDays: 3,
        seller: sellers[0]._id,
        category: categories[0]._id
      },
      {
        title: 'Portable Charger 20000mAh',
        description: 'High-capacity power bank for all devices',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=500&q=80',
        deliveryDays: 1,
        seller: sellers[0]._id,
        category: categories[0]._id
      },
      {
        title: 'USB-C Hub 7-in-1',
        description: 'Multi-port USB-C adapter for laptops',
        price: 45.99,
        image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=500&q=80',
        deliveryDays: 2,
        seller: sellers[0]._id,
        category: categories[0]._id
      },
      
      // Fashion (Seller 2)
      {
        title: 'Classic Denim Jacket',
        description: 'Timeless denim jacket, available in multiple sizes',
        price: 59.99,
        image: 'https://images.unsplash.com/photo-1601333144130-8cbb312386b6?auto=format&fit=crop&w=500&q=80',
        deliveryDays: 3,
        seller: sellers[1]._id,
        category: categories[1]._id
      },
      {
        title: 'Running Shoes - Performance',
        description: 'Lightweight running shoes with cushioned sole',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
        deliveryDays: 2,
        seller: sellers[1]._id,
        category: categories[1]._id
      },
      {
        title: 'Leather Crossbody Bag',
        description: 'Stylish genuine leather bag',
        price: 69.99,
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=500&q=80',
        deliveryDays: 4,
        seller: sellers[1]._id,
        category: categories[1]._id
      },
      {
        title: 'Cotton T-Shirt Pack (3)',
        description: 'Pack of 3 premium cotton t-shirts',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80',
        deliveryDays: 2,
        seller: sellers[1]._id,
        category: categories[1]._id
      },
      
      // Home & Garden (Seller 3)
      {
        title: 'Ceramic Plant Pot Set',
        description: 'Set of 3 decorative ceramic plant pots',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=500&q=80',
        deliveryDays: 3,
        seller: sellers[2]._id,
        category: categories[2]._id
      },
      {
        title: 'LED String Lights',
        description: 'Warm white LED lights for indoor/outdoor use',
        price: 18.99,
        image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=500&q=80',
        deliveryDays: 2,
        seller: sellers[2]._id,
        category: categories[2]._id
      },
      {
        title: 'Kitchen Knife Set',
        description: 'Professional 8-piece knife set with block',
        price: 129.99,
        image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=500&q=80',
        deliveryDays: 3,
        seller: sellers[2]._id,
        category: categories[2]._id
      },
      {
        title: 'Throw Pillow Covers (4 Pack)',
        description: 'Decorative pillow covers in various colors',
        price: 22.99,
        image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=500&q=80',
        deliveryDays: 2,
        seller: sellers[2]._id,
        category: categories[2]._id
      },
      
      // Books (Seller 1)
      {
        title: 'JavaScript: The Complete Guide',
        description: 'Comprehensive guide to modern JavaScript',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=500&q=80',
        deliveryDays: 5,
        seller: sellers[0]._id,
        category: categories[3]._id
      },
      {
        title: 'Mystery Novel Collection',
        description: 'Box set of 5 bestselling mystery novels',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80',
        deliveryDays: 4,
        seller: sellers[0]._id,
        category: categories[3]._id
      },
      
      // Sports (Seller 2)
      {
        title: 'Yoga Mat with Carry Strap',
        description: 'Non-slip yoga mat with alignment markers',
        price: 32.99,
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=500&q=80',
        deliveryDays: 2,
        seller: sellers[1]._id,
        category: categories[4]._id
      },
      {
        title: 'Resistance Bands Set',
        description: '5 resistance levels for home workouts',
        price: 19.99,
        image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=500&q=80',
        deliveryDays: 2,
        seller: sellers[1]._id,
        category: categories[4]._id
      },
      
      // Toys (Seller 3)
      {
        title: 'Building Blocks Set - 500 Pieces',
        description: 'Educational building blocks for kids',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=500&q=80',
        deliveryDays: 3,
        seller: sellers[2]._id,
        category: categories[5]._id
      },
      {
        title: 'Board Game - Strategy Edition',
        description: 'Fun strategy board game for family nights',
        price: 44.99,
        image: 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?auto=format&fit=crop&w=500&q=80',
        deliveryDays: 3,
        seller: sellers[2]._id,
        category: categories[5]._id
      }
    ]);
    
    console.log(`✅ Created ${products.length} products`);
    
    // ==================== CREATE ORDERS ====================
    console.log('🛒 Creating orders...');
    
    const orders = await Order.insertMany([
      // Order 1 - Buyer 1
      {
        buyer: buyers[0]._id,
        items: [
          {
            product: products[0]._id,
            quantity: 1,
            price: products[0].price
          },
          {
            product: products[2]._id,
            quantity: 2,
            price: products[2].price
          }
        ],
        total: products[0].price + (products[2].price * 2),
        status: 'delivered'
      },
      // Order 2 - Buyer 1
      {
        buyer: buyers[0]._id,
        items: [
          {
            product: products[4]._id,
            quantity: 1,
            price: products[4].price
          }
        ],
        total: products[4].price,
        status: 'shipped'
      },
      // Order 3 - Buyer 2
      {
        buyer: buyers[1]._id,
        items: [
          {
            product: products[1]._id,
            quantity: 1,
            price: products[1].price
          },
          {
            product: products[8]._id,
            quantity: 1,
            price: products[8].price
          }
        ],
        total: products[1].price + products[8].price,
        status: 'processing'
      },
      // Order 4 - Buyer 2
      {
        buyer: buyers[1]._id,
        items: [
          {
            product: products[5]._id,
            quantity: 1,
            price: products[5].price
          }
        ],
        total: products[5].price,
        status: 'delivered'
      },
      // Order 5 - Buyer 3
      {
        buyer: buyers[2]._id,
        items: [
          {
            product: products[10]._id,
            quantity: 1,
            price: products[10].price
          },
          {
            product: products[11]._id,
            quantity: 2,
            price: products[11].price
          }
        ],
        total: products[10].price + (products[11].price * 2),
        status: 'pending'
      }
    ]);
    
    console.log(`✅ Created ${orders.length} orders`);
    
    // ==================== CREATE RATINGS ====================
    console.log('⭐ Creating ratings...');
    
    const ratings = await Rating.insertMany([
      {
        user: buyers[0]._id,
        product: products[0]._id,
        rating: 5,
        comment: 'Excellent sound quality! Highly recommend.'
      },
      {
        user: buyers[0]._id,
        product: products[2]._id,
        rating: 4,
        comment: 'Good power bank, charges quickly.'
      },
      {
        user: buyers[1]._id,
        product: products[1]._id,
        rating: 5,
        comment: 'Love this smartwatch! Great features.'
      },
      {
        user: buyers[1]._id,
        product: products[5]._id,
        rating: 4,
        comment: 'Very comfortable running shoes.'
      },
      {
        user: buyers[2]._id,
        product: products[4]._id,
        rating: 5,
        comment: 'Perfect fit and great quality!'
      },
      {
        user: buyers[0]._id,
        product: products[8]._id,
        rating: 5,
        comment: 'Beautiful plant pots, exactly as described.'
      },
      {
        user: buyers[1]._id,
        product: products[10]._id,
        rating: 4,
        comment: 'Sharp knives, good value for money.'
      },
      {
        user: buyers[2]._id,
        product: products[14]._id,
        rating: 5,
        comment: 'Great yoga mat, very durable.'
      }
    ]);
    
    console.log(`✅ Created ${ratings.length} ratings`);
    
    // ==================== CREATE COMMENTS ====================
    console.log('💬 Creating product comments...');
    
    const comments = await Comment.insertMany([
      {
        author: buyers[0]._id,
        product: products[0]._id,
        body: 'Does this come with a carrying case?'
      },
      {
        author: sellers[0]._id,
        product: products[0]._id,
        body: 'Yes, it includes a premium carrying case!'
      },
      {
        author: buyers[1]._id,
        product: products[1]._id,
        body: 'Is this water resistant?'
      },
      {
        author: sellers[0]._id,
        product: products[1]._id,
        body: 'Yes, it has IP68 water resistance rating.'
      },
      {
        author: buyers[2]._id,
        product: products[4]._id,
        body: 'What sizes are available?'
      },
      {
        author: sellers[1]._id,
        product: products[4]._id,
        body: 'Available in S, M, L, XL, and XXL.'
      },
      {
        author: buyers[0]._id,
        product: products[10]._id,
        body: 'Are these dishwasher safe?'
      },
      {
        author: sellers[2]._id,
        product: products[10]._id,
        body: 'We recommend hand washing for longevity.'
      }
    ]);
    
    console.log(`✅ Created ${comments.length} product comments`);
    
    // ==================== CREATE ORDER COMMENTS ====================
    console.log('💬 Creating order comments...');
    
    const orderComments = await OrderComment.insertMany([
      {
        user: buyers[0]._id,
        order: orders[0]._id,
        comment: 'When will this be shipped?'
      },
      {
        user: buyers[1]._id,
        order: orders[2]._id,
        comment: 'Please include gift wrapping.'
      },
      {
        user: buyers[2]._id,
        order: orders[4]._id,
        comment: 'Can you expedite the shipping?'
      }
    ]);
    
    console.log(`✅ Created ${orderComments.length} order comments`);
    
    // ==================== CREATE FLAGS ====================
    console.log('🚩 Creating flags...');
    
    const flags = await Flag.insertMany([
      {
        reporter: buyers[0]._id,
        product: products[12]._id,
        reason: 'Product description does not match actual item',
        resolved: false
      },
      {
        reporter: buyers[1]._id,
        target: sellers[2]._id,
        reason: 'Seller not responding to messages',
        resolved: false
      },
      {
        reporter: sellers[0]._id,
        target: buyers[2]._id,
        reason: 'Buyer requesting refund without valid reason',
        resolved: true
      }
    ]);
    
    console.log(`✅ Created ${flags.length} flags`);
    
    // ==================== CREATE CARTS ====================
    console.log('🛍️  Creating shopping carts...');
    
    const carts = await Cart.insertMany([
      {
        user: buyers[0]._id,
        items: [
          {
            product: products[6]._id,
            quantity: 1,
            price: products[6].price,
            subtotal: products[6].price
          },
          {
            product: products[9]._id,
            quantity: 2,
            price: products[9].price,
            subtotal: products[9].price * 2
          }
        ],
        totalPrice: products[6].price + (products[9].price * 2),
        totalItems: 3
      },
      {
        user: buyers[1]._id,
        items: [
          {
            product: products[3]._id,
            quantity: 1,
            price: products[3].price,
            subtotal: products[3].price
          }
        ],
        totalPrice: products[3].price,
        totalItems: 1
      }
    ]);
    
    console.log(`✅ Created ${carts.length} shopping carts`);
    
    // ==================== SUMMARY ====================
    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${sellers.length + buyers.length + 1} (${sellers.length} sellers, ${buyers.length} buyers, 1 admin)`);
    console.log(`   📁 Categories: ${categories.length}`);
    console.log(`   📦 Products: ${products.length}`);
    console.log(`   🛒 Orders: ${orders.length}`);
    console.log(`   ⭐ Ratings: ${ratings.length}`);
    console.log(`   💬 Product Comments: ${comments.length}`);
    console.log(`   💬 Order Comments: ${orderComments.length}`);
    console.log(`   🚩 Flags: ${flags.length}`);
    console.log(`   🛍️  Shopping Carts: ${carts.length}`);
    console.log('\n📝 Test Credentials:');
    console.log('   Sellers:');
    console.log('      - seller1@test.com / password123 (TechStore)');
    console.log('      - seller2@test.com / password123 (FashionHub)');
    console.log('      - seller3@test.com / password123 (HomeGoods)');
    console.log('   Buyers:');
    console.log('      - buyer1@test.com / password123 (John Doe)');
    console.log('      - buyer2@test.com / password123 (Jane Smith)');
    console.log('      - buyer3@test.com / password123 (Mike Johnson)');
    console.log('   Admin:');
    console.log('      - admin@test.com / password123');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

seedDatabase();
