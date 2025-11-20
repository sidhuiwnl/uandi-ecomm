const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');


router.get("/get-all",collectionController.getAllCollections);

router.post("/", collectionController.addCollection);

router.post("/map-products", collectionController.mapProductsToCollection);

router.get("/:id/products", collectionController.getCollectionWithProducts);

router.post(
    "/:collection_id/update-sort-order",
    collectionController.updateCollectionOrder
);



module.exports = router;