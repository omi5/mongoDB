const express = require('express');
const mongoose = require('mongoose');
const send = require('send');
const app = express();
const port = 3000;

//MiddleWare Created Here
app.use(express.json()) // MiddleWare For JSON
app.use(express.urlencoded({extended: true})) // MiddleWare For form.

//Create a Schema For DB
//Fisrt we have to call the "new mongoose.Schema" and store this in a variable

const ProductSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    price: Number,
    description: String,
    createdBy: {
        type: Date,
        default: Date.now,
    }
});

//Create a Model over Here
// we have to call mongoose.model in here

const ProductModel = mongoose.model('Products', ProductSchema) // in the parameter we provided the collection name we want to make and the schema we make here



// One Way to Connect a DataBase
// mongoose.connect('mongodb://localhost:27017/userDB')
// .then(()=>console.log('DB is connected'))
// .catch((err)=>console.log(err.message));

//Trying Another Way to Conenct a DataBase By using async await
const ConnectDB = async () =>{
   try {
    await mongoose.connect('mongodb://localhost:27017/productDB');
    console.log('DB is Connected!');
   } catch (error) {
    console.log('DB is Not Connected', error.message);
   }
}

//Server is running Here
app.listen(port, async ()=>{
    console.log(`Server is running on port http://localhost:${port}`);
    await ConnectDB();
})

//Routes Over Here

app.get('/', (req,res)=>{
    res.send('Welcome to home page!')
})

//post request for create a new product by using model

app.post('/products', async (req,res) =>{
    try {
        //Store the value we found
        const title = req.body.title;
        const price = req.body.price;
        const description = req.body.description;

        //We Try to Save Data To the DB Using The Model We Created
        const newProduct = new ProductModel({
            title: title,
            price: price,
            description: description,
        })
        //Now we have to save this model to the DB
        const newProductCreate = await newProduct.save()
        res.status(201).send(newProductCreate)
    } catch (error) {
        res.status(500).send({message: error.message})
    }

})

app.get('/products', async (req,res) =>{
    try {
        //Find all Products
        const products = await ProductModel.find();
        res.status(200).send(products)

    } catch (error) {
        res.status(404).send('Products Not Found!');
    }
})

app.get('/products/:id', async(req,res)=>{
    try {
        const id = req.params.id;
        const product = await ProductModel.find({_id: id},{title:1,_id:0});

        res.status(200).send(product);
    } catch (error) {
        res.status(404).send('Products Not Found!');
    }
})

app.get('/products?price', async (req,res) =>{
    try {
        let price = req.query.price;
   
    if(price){
        const product = await ProductModel.find({$gt:{$price}})
        res.status(200).send({
            success: true,
            data:[product]
        })
    }
    else{
        const products = await ProductModel.find();
        res.status(200).send({
            success: true,
            message: "this is data",
            data:[products],
        })
    }
    } catch (error) {
        res.send(error.message)
        res.status(500).send({
            success:false,
            message: error.message,

        })
    }
})
