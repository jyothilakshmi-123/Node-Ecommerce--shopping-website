const { response } = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProduct().then((products)=>{
    console.log(products)
    res.render('admin/view-products',{admin:true,products});
  })
 
});

router.get('/add-product',function(req,res){
  console.log("......................")
  res.render('admin/add-product')

});
router.post('/add-product',(req,res)=>{
  console.log(req.body);
  console.log(req.files.image)

  productHelpers.addProduct(req.body,(id)=>{
    var image = req.files.image
    console.log(id)
    image.mv('./public/product-image/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render('admin/add-product')
      }
      else{
        console.log(err)
      }
    })
    

  })
})
router.get('/delete-product/:id',(req,res)=>{
  let proId = req.params.id
  productHelper.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
  })

})
// we can also take proId in this way
// router.get('/delete-product',(req,res)=>{ 
//   let proId = req.query.id
//   console.log(proId)
//   console.log(req.query.name)
// })
router.get('/edit-product/:id', async(req,res)=>{
  let product =await productHelpers.getProductDetails(req.params.id)
  console.log(product)
  res.render('admin/edit-product',{product})
})
router.post('/edit-product/:id',(req,res)=>{
  console.log(req.params.id)
  let id = req.params.id
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.image){
      let image = req.files.image
      image.mv('./public/product-image/'+id+'.jpg')
    }
  })
})
module.exports = router;

