import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { setMyOrders, setUserData } from '../redux/userSlice'
import { useDispatch, useSelector } from 'react-redux'

const useGetMyOrder = () => {
  const dispatch = useDispatch()
  const {userData} = useSelector(state=>state.user)
  useEffect(()=>{
    const fetchOrders = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/order/my-orders`,{withCredentials:true})
        dispatch(setMyOrders(result.data))
        
      } catch (error) {
        console.log(error)
      }
    }
    fetchOrders()
  },[userData])
}

export default useGetMyOrder
