import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { setShopsInMyCity, setUserData } from '../redux/userSlice'
import { useDispatch, useSelector } from 'react-redux'

const useGetshopBycity = () => {
  const dispatch = useDispatch()
  const {currentCity} = useSelector(state=>state.user)
  useEffect(()=>{
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-by-city/${currentCity}`,{withCredentials:true})
        dispatch(setShopsInMyCity(result.data))
        
      } catch (error) {
        console.log(error)
      }
    }
    fetchUser()
  },[currentCity])
}

export default useGetshopBycity
