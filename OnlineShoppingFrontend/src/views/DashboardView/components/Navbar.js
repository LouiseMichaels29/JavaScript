import { Link } from 'react-router-dom';
import { Icon } from 'react-icons-kit';
import { cart } from 'react-icons-kit/entypo/cart';
import { useEffect, useState } from "react";
import useIsMountedRef from "../../../hook/useIsMountedRef";

export const Navbar = ({ user, logout, onSubscription}) => {

    const [upgradeIsLoading, setUpgradeLoading] = useState(false);
    const isMountedRef = useIsMountedRef();

    useEffect(() => {
        if (upgradeIsLoading) {
          onSubscription().then(() => {
            if (isMountedRef.current) setUpgradeLoading(false);
          });
        }
    }, [upgradeIsLoading]);

    return (
        <div className='navbox'>
            {!user && <div className='rightside'>
                <span><Link to="signup" className='navlink'>SIGN UP</Link></span>
                <span><Link to="login" className='navlink'>LOGIN</Link></span>
            </div>}
            {user && <div className='rightside'>
                <span><Link to="../cart" className='navlink'><Icon icon={cart} /></Link></span>
                <span><button className='logout-btn' onClick={() => logout()}>Logout</button></span>
                <span><button 
                    disabled={upgradeIsLoading}
                    onClick={() => setUpgradeLoading(true)}>
                    checkout
                </button></span>
            </div>}
        </div>
    )
}

