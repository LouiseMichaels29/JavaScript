import { useState, useEffect } from 'react';

const Products = ({ addProduct }) => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch('https://fakestoreapi.com/products')
        .then((res) => res.json())
        .then((data) =>{
            setData(data);
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {

            setLoading(false);
        });
    }, []);

    if(loading){
        return (
            <div className="loading">
                <p>loading...</p>
            </div>
        )
    }
    
    return (
        <div className="products">
            <h1>Products</h1>
            {data.map((item, index) => (
                <li key={index}> 
                    {"Product: " + item.title} 
                    <button className='addcart-btn' onClick={() => addProduct(item)}> ADD TO CART </button>
                    <h5>{"Price: $" + item.price}</h5>
                </li>
            ))}
        </div>
    )
};

export default Products;
