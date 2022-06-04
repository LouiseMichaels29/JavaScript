const { db } = require("../../utils/admin");

exports.getProducts = async (req, res) => {

  const email = req.user.email;

  try {
    let productCollection = await db.collection(`/users/${email}/products`).get();
    let result = [];

    for (let doc of productCollection.docs) {

      result.push({
        id: doc.id,
        ...doc.data(),
      });
    }

    return res.status(200).json({ result: result });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error });
  }
};

exports.addProduct = async (req, res) => {

  const email = req.user.email;

  try {
    let product = req.body.product;

    let productDoc = db.collection(`/users/${email}/products`).doc();
    productDoc.set({
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image,
      rating: product.rating,
    });
    
    product.id = productDoc.id;
    return res.status(200).json({ result: product });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error });
  }
};

exports.deleteProduct = async (req, res) => {

  const email = req.user.email;
  
  try {
    let id = req.params.id;

    let productDocRef = db.doc(`/users/${email}/products/${id}`);
    await productDocRef.delete();

    return res.status(200).json({ result: true });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error });
  }
};
