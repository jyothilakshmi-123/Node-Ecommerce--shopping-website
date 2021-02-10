const { response } = require('express');
var express = require('express');
const session = require('express-session');
var router = express.Router();
// let totalValue;
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const verifyLogin = (req,res,next)=>{
  if(req.session.userloggedIn){
    next()
  }
  else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async function(req, res, next) {   
  let user = req.session.user
  console.log(user)
  let cartCount = null
  if(user){
    cartCount =await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProduct().then((products)=>{
    // console.log(products)
    res.render('user/view-products',{products,user,cartCount});
  })
});

router.get('/login',(req,res)=>{
  if(req.session.user){
    res.redirect("/")
  }else{
    res.render('user/login',{'loginErr':req.session.userLogginErr})
    req.session.userLogginErr = false
  }
  
})
router.get('/signup',(req,res)=>{

  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
  console.log(req.body)
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response);
    req.session.user = response
    req.session.userloggedIn=true
    res.redirect('/')
  })

})
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
  if(response.status){
    req.session.user = response.user
    req.session.userloggedIn = true
    res.redirect('/')

  }else{
    req.session.userLogginErr = "Invalid username or password" 
    res.redirect('/login')
  }
})

})
router.get('/logout',(req,res)=>{
  req.session.user = null
  res.redirect('/')
})
router.get('/cart',verifyLogin,async(req,res)=>{
  let products =await userHelpers.getCartProducts (req.session.user._id)
  let totalValue = await userHelpers.getTotalAmount(req.session.user._id)
  
  console.log("Printinh totalvalue---------------------> " +totalValue)
  res.render('user/cart',{products,user:req.session.user._id,totalValue})
})
router.get('/add-to-cart/:id',(req,res)=>{
  console.log("api call")
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
    // res.redirect('/')
  })
})
router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.body)   
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
  response.total = await userHelpers.getTotalAmount(req.session.user._id)
  
    res.json(response)       
  })
})
router.post('/remove-product',(req,res,next)=>{
  console.log(req.body)
  userHelpers.removeCart(req.body).then((response)=>{
    res.json(response)

  })    
})
router.get('/place-order', verifyLogin, async(req,res)=>{
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total,user:req.session.user})
})
 
router.post('/place-order',async (req,res)=>{
  let products = await userHelpers.getCartProductList(req.body.userId)
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice)  .then((response)=>{
    res.json({status:true})

 })
 console.log(req.body)
})  
router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})
router.get('/orders',async(req,res)=>{
  let orders = await userHelpers.getUserOrders(req.session.user._id) 
  res.render('user/orders'),{user:req.session.user,orders}
})
module.exports = router;   

