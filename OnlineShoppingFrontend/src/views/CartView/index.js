import { useState, useEffect } from 'react'; 
import useAuth from "../../hook/useAuth";
import { FaTrash } from 'react-icons/fa'; 
import { Navigate } from "react-router-dom";
import { IoBagCheckOutline } from 'react-icons/io5';
import { Navbar } from '../DashboardView/components/Navbar';
import useIsMountedRef from "../../hook/useIsMountedRef";

const CartView = () => {

    // const { user } = useAuth();
    const { user, logout } = useAuth();
    const [error, setError] = useState(null);
    const [products, setProducts] = useState([]);
    const [clientSecret, setClientSecret] = useState(null);
    const isMountedRef = useIsMountedRef();

    const fetchProductsServer = async () => {

        const token = await user.getIdToken();
        const res = await fetch(process.env.REACT_APP_SERVER_URL + "/products", 
        {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const data = await res.json();
        return data.result;
      };
    
      useEffect(() => {
    
        const getProducts = async () => {
    
          try{
            const ProductsFromServer = await fetchProductsServer();
             setProducts(ProductsFromServer);
          } catch(err){
              setError(err.message);
          }
        };
    
        getProducts();
      }, []);

      const deleteProductServer = async (id) => {

        const token = await user.getIdToken();
        const res = await fetch(process.env.REACT_APP_SERVER_URL + `/products/${id}`, 
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
    
        return res.status;
      };
    
      const deleteProduct = async (id) => {
    
        try{
            const status = await deleteProductServer(id);
    
            if(status === 200) setProducts(products.filter(
              (product) => product.id !== id));
            else alert("Error Deleting Product");
        } catch(err){
            setError(err.message);
        }
      };
  
    let total = 0;
    products.forEach(item => {

      total += item.price;
    });

    const createSubscriptionServer = async () => {
      const token = await user.getIdToken();
      const res = await fetch(
        process.env.REACT_APP_SERVER_URL + `/subscription/stripe/create`,
        {
          method: "GET",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const data = await res.json();
      return data.result;
    };
  
    const createSubscriptionFront = async () => {
      let response = await createSubscriptionServer();
      if (isMountedRef.current) setClientSecret(response.clientSecret);
    };

    if (user === null || user === undefined)
      return <Navigate to={{ pathname: "/" }} />;
    if (clientSecret)
      return <Navigate to="/checkout" state={{ clientSecret: clientSecret }} />;

    return (
        <div className="cart">
            <Navbar user={user} 
              logout={logout} 
              onSubscription={createSubscriptionFront}
            />
            <h1>Cart</h1>
            {products.map((item, index) =>
                <li key={index}>
                    {"Product: " + item.title + "       "}
                    <FaTrash style={{ 
                      color: 'black', 
                      cursor: 'pointer'
                    }} onClick={() => deleteProduct(item.id)}/>
                    <h5>{"Price: " + item.price}</h5>
                </li>
            )}
            {total ? (
              <h4>{"Total: " + total}</h4>
            ) : (
              <h4>No items in shopping cart</h4>
            )}
        </div>
    )
}

export default CartView;

