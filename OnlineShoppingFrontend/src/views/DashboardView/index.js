import { useState, useEffect } from 'react';
import { useQueryClient } from "react-query";
import { Navigate } from "react-router-dom";
import { Navbar } from './components/Navbar';
import Products from './components/Products';
import useAuth from "../../hook/useAuth";
import useSubscription from "../../hook/useSubscription";
import useIsMountedRef from "../../hook/useIsMountedRef";

const Dashboard = () => {

  const { user, logout } = useAuth();
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  const isMountedRef = useIsMountedRef();
  const subscription = useSubscription(); 
  const queryClient = useQueryClient();
  const [clientSecret, setClientSecret] = useState(null);

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
        if (isMountedRef.current) setProducts(ProductsFromServer);
      } catch(err){
          setError(err.message);
      }
    };

    getProducts();
  }, []);

  const addProductServer = async (product) => {

    const token = await user.getIdToken();
    const res = await fetch(process.env.REACT_APP_SERVER_URL + "/products", 
    {
      method: "POST", 
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({product: product}),
    });

    const data = await res.json();
    return data.result;
  };

  const addProduct = async (product) => {

    try{
        const data = await addProductServer(product);
        setProducts([...products, data]);
    }catch(err){
        setError(err.message);
    }
  };

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

  const cancelSubscriptionServer = async () => {
    const token = await user.getIdToken();
    const res = await fetch(
      process.env.REACT_APP_SERVER_URL + `/subscription/stripe/cancel`,
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

  const cancelSubscriptionFront = async () => {
    let response = await cancelSubscriptionServer();
    queryClient.invalidateQueries("getSubscription");
    return response;
  };

 const getUserInfo = () => {
   let message = "";

   if (
     subscription &&
     subscription.tier === "premium" &&
     (subscription.canceled === null || subscription.canceled === undefined)
   ) 
     message = (
       <p>
         Your subscription is being processed. You can refresh the page in a
         minute.
       </p>
     );
   
   else if (
     subscription &&
     subscription.tier === "premium" &&
     subscription.canceled
   ) 
     message = (
       <p>
         Your subscription is canceled but you can still use the premium
         service till {subscription.renewTime.split("T")[0]}.
       </p>
     );
   else if (
     subscription &&
     subscription.tier === "premium" &&
     subscription.canceled === false
   )
     message = <p>Welcome premium user!</p>;

   return message;
 };

  if (user === null || user === undefined)
    return <Navigate to={{ pathname: "/" }} />;

  if (clientSecret)
    return <Navigate to="/checkout" state={{ clientSecret: clientSecret }} />;

  return (
      <div className="container">
        <Navbar user={user} 
        logout={logout} 
        onSubscription={createSubscriptionFront}
        />
        <Products addProduct={addProduct} />
      </div>
  );
}

export default Dashboard;



