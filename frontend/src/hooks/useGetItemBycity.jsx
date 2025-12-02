import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { setItemsInMyCity, setShopsInMyCity, setUserData } from '../redux/userSlice'
import { useDispatch, useSelector } from 'react-redux'

const useGetItemBycity = () => {
  const dispatch = useDispatch()
  const {currentCity} = useSelector(state=>state.user)
  useEffect(()=>{
    const fetchItem = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/item/get-by-city/${currentCity}`,{withCredentials:true})
        dispatch(setItemsInMyCity(result.data))
        
      } catch (error) {
        console.log(error)
      }
    }
    fetchItem()
  },[currentCity])
}

export default useGetItemBycity
