const mongoose = require('mongoose');
const uri = 'mongodb://localhost:27017/pharmacy';
(async () => {
  try {
    await mongoose.connect(uri, { bufferCommands:false, serverSelectionTimeoutMS:5000, socketTimeoutMS:10000 });
    const prodSchema = new mongoose.Schema({ isdeleted:Boolean }, { strict:false });
    const Product = mongoose.model('Product', prodSchema, 'products');
    const total = await Product.countDocuments();
    const hasDeleted = await Product.countDocuments({ isdeleted: true });
    const hasFalse = await Product.countDocuments({ isdeleted: false });
    const missing = await Product.countDocuments({ isdeleted: { $exists: false } });
    console.log(JSON.stringify({ total, hasDeleted, hasFalse, missing }, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
