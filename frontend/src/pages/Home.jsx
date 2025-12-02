import React from 'react'
import { useSelector } from 'react-redux'
import UserDashboad  from '../components/userDashboad'
import OwnerDashboad from '../components/OwnerDashboad'
import DeliveryBoydash from '../components/DeliveryBoydash'
const Home = () => {
  const {userData} = useSelector(state=>state.user)
  return (
    <div>
      {userData.role == "user" && <UserDashboad />}
      {userData.role == "owner" && <OwnerDashboad/>}
      {userData.role == "deliveryBoy" && <DeliveryBoydash />}
    </div>
  )
}

export default Home
