const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');

//getProducts
exports.getProducts = (req,res,next)=>{

    Product.findAll()
    .then((products) => {
        res.render('shop/product-list' , {
            pageTitle : 'All Products' , 
            path : '/products' ,
            products : products
        });
    })
    .catch( err => { console.log(err) });
};


//getProduct
exports.getProduct = (req,res,next)=>{

    const productId = req.params.productId;
    console.log(productId)

  Product.findByPk(productId)
    .then(product => {
        res.render('shop/product-detail' , {
            pageTitle : product.name , 
            path : '/products' ,
            product : product
        })
    }).catch(err => console.log(err));

};


//getIndex
exports.getIndex = (req,res,next)=>{
    Product.findAll()
    .then((products) => {
        res.render('shop/index' , {
            pageTitle : 'Index Products' , 
            path : '/' ,
            products : products
        });
    })
    .catch( err => { console.log(err) });
   
};


//postCart
exports.postCart = (req,res,next)=>{
    productId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;

    req.user
    .getCart()
    .then(cart => {
        fetchedCart = cart;
        return cart.getProducts({ where : { id : productId } });
    })
    .then(products => {
        let product;
        if(products.length > 0 ){
          product = products[0];
        }
        
        if(product){
            const oldQuantity = product.cartItem.quantity;
            newQuantity = oldQuantity + 1 ;
            return product;
        }else{
            return Product.findByPk(productId);
        }
    })
    .then(product => {
        return fetchedCart.addProduct(product,{
            through: {
                quantity : newQuantity
            }
        })
    })
    .then(() => {
        res.redirect('/cart') 
    })
    .catch(err=>console.log(err));
  
};

//postCartDeleteItem
exports.postCartDeleteItem = (req,res,next) => {
    const productId = req.body.productId;
    req.user.getCart()
    .then( cart => {
        return cart.getProducts({ where : {id : productId } });
    })
    .then(products => {
        const product = products[0];
        return  product.cartItem.destroy();
    })
    .then(result => {
        res.redirect('/cart')
    })
    .catch(err => console.log(err));
    
}

//getCart
exports.getCart = (req,res,next)=>{
  
    req.user.getCart()
    .then(cart => {
     return  cart.getProducts();
    })
    .then( products => {
        res.render('shop/cart' , {
            pageTitle : 'Your Cart' , 
            path : '/cart',
            products : products
        });
    })
    .catch(err=>console.log(err));

};

exports.postOrders = (req,res,next) => {
    let fetchedCart;
    req.user
    .getCart()
    .then(cart => {
        fetchedCart = cart;
        return cart.getProducts();
    })
    .then(products => {
        return  req.user.createOrder()
        .then( order => {
            return order.addProducts( products.map(product => {
                product.orderItem = { quantity : product.cartItem.quantity } ;
                return product;
            }))
        })
        .catch(err => console.log(err));
        //console.log(products)
    })
    .then(result => {
        return fetchedCart.setProducts(null);
    })
    .then(result => {
        res.redirect('/orders');
    })
    .catch(err => console.log(err));
}

exports.getOrders = (req,res,next) => {
    req.user.getOrders({include: ['products']})
    .then(orders => {
        res.render('shop/order' , {
            pageTitle : 'Order' , 
            path : '/orders',
            orders : orders
        });
    })
    .catch(err => console.log(err));
    
}


