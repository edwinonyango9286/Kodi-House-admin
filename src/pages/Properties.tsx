import { Box, Divider, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import dropdownGreyIcon from "../assets/logos and Icons-20230907T172301Z-001/logos and Icons/dropdown Icon grey.svg"
import refreshIcon from "../assets/logos and Icons-20230907T172301Z-001/logos and Icons/refresh icon.svg"
import searchIcon from "../assets/logos and Icons-20230907T172301Z-001/logos and Icons/search icon.svg"
import filterIcon from "../assets/logos and Icons-20230907T172301Z-001/logos and Icons/filter icon.svg"
import deleteIcon from "../assets/logos and Icons-20230907T172301Z-001/logos and Icons/delete Icon.svg"
import printerIcon from "../assets/logos and Icons-20230907T172301Z-001/logos and Icons/printer icon.svg"
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { listOccuppiedProperties, listProperties, listVacantProperties } from '../components/services/propertyService'
import { listUnits } from '../components/services/unitsService'
import editIcon from "../assets/logos and Icons-20230907T172301Z-001/logos and Icons/edit icon.svg"
import deleteIconGrey from "../assets/logos and Icons-20230907T172301Z-001/logos and Icons/deleted Icon grey.svg"
import dotsVertical from "../assets/logos and Icons-20230907T172301Z-001/logos and Icons/dots vertical icon.svg"
import { debounce } from 'lodash';
import NoRowsOverlay from '../components/common/NoRowsOverlay'

const Properties = () => {
  interface IProperty {
    _id:string;
    createdBy:{
      userName:string;
    }
    name:string;
    type:string;
    numberOfUnits:number;
    occupiedUnits:number;
    currentStatus:string;
    category:string;
    images:Array<{
      secure_url:string;
      public_id:string;
      _id:string;
    }>
  }


  const [propertiesList,setPropertiesList] = useState<IProperty[]>([])
  const [loadingProperties,setLoadingProperties]  = useState<boolean>(false)
  const [unitsCount,setUnitsCount] = useState<number>(0);
  const [searchQuery,setSearchQuery] = useState<string>("")

  const propertyColumns: GridColDef[] = [
    {field:"propertyImage", headerName:"Property Image" , flex:1,
      renderCell:(params)=>{
        const propertyImage = params.row.propertyImage 
        return (
          <Box sx={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"10px", width:"120px", height:"100%"}}>
            <img src={propertyImage} alt="propertyImage" style={{ flexShrink:0, borderRadius:"20px", width:"80px" , height:"80px", objectFit:"cover"}} />
          </Box>
        )
      }
    },
    {field:"propertyName", headerName:"Property Name" , flex:1},
    {field:"propertyType", headerName:"Property Type" , flex:1},
    {field:"propertyCategory", headerName:"Property Category" , flex:1},
    {field:"numberOfUnits", headerName:"Units" , flex:1},
    {field:"occupiedUnits", headerName:"Occupied Units" , flex:1},
    {field:"landlordName", headerName:"Landlord Name" , flex:1},
    {field:"status", headerName:"Status" , flex:1,
      renderCell:(params)=>(
        <Box sx={{ display:"flex", alignItems:"center", height:"100%"}}>
          <Typography sx={{ padding:"4px 8px", borderRadius:"16px", color:params.row.status === "Vacant" ? "#B42318":"#027A48", backgroundColor: params.row.status ==="Vacant" ? "#FEF3F2" : "#ECFDF3" }}>{params.row.status}</Typography>
        </Box>
    )
    },
    {field:"action", headerName:"Action" , flex:1, renderCell:()=>(
      <Box sx={{display:"flex", gap:"10px", alignItems:"center", height:"100%", justifyContent:"start"}}>
      <IconButton>
        <img src={editIcon} style={{ width:"24px", height:"24px"}} alt="editIcon" />
      </IconButton>
       <IconButton >
        <img src={deleteIconGrey} style={{ width:"24px", height:"24px"}} alt="deleteIcon" />
      </IconButton>
       <IconButton >
        <img src={dotsVertical} style={{ width:"24px", height:"24px"}} alt="dotsVertical" />
      </IconButton>
    </Box>
  )},
  ]

  const propertyRows = propertiesList.map((property)=>({
    id:property?._id,
    propertyName:property?.name,
    propertyType:property?.type || "N/A",
    numberOfUnits:property?.numberOfUnits,
    occupiedUnits:property?.occupiedUnits,
    landlordName:property?.createdBy?.userName,
    status:property?.currentStatus,
    propertyCategory:property?.category,
    propertyImage: property?.images?.[0]?.secure_url
  }))



const listAllProperties = useCallback( async (search = "") => {
  try {
    setLoadingProperties(true);
    const response = await listProperties(search ? { search } : undefined);
    if (response.status === 200) {
      setPropertiesList(response.data.data);
    }
  } catch (error) {
    console.log(error);
  } finally {
    setLoadingProperties(false);
  }
},[]);

 const debouncedSearch = useMemo(
  () =>
    debounce((value: string) => {
      listAllProperties(value);
    },500),[listAllProperties]);

  const handleSearch = (e:React.ChangeEvent<HTMLInputElement>) =>{
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value)
  }


useEffect(() => {
  return () => {
    debouncedSearch.cancel();
  };
}, [debouncedSearch]);

  useEffect(()=>{
    listAllProperties()
  },[listAllProperties])
  

  const listAllUnits =  async ()=>{
    try {
      const response = await listUnits();
      if(response.status === 200){
        setUnitsCount(response?.data?.data?.unitsCount)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
   listAllUnits()
  },[])
  
  const [occuppiedProperties,setOccuppiedProperties] = useState([]);

  const listAllOccuppiedProperties = async() => {
    try {
      const response = await listOccuppiedProperties()
      if(response.status === 200){
        setOccuppiedProperties(response.data.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    listAllOccuppiedProperties();
  },[])

  const [vaccantProperties,setVaccantProperties] = useState([])

  const listAllVacantProperties = async ()=>{
    try {
      const response = await listVacantProperties();
      if(response.status === 200 ){
        setVaccantProperties(response.data.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    listAllVacantProperties()
  },[])



  return (
    <Box sx={{width:"100%",}}>
      <Paper elevation={0} sx={{ borderRadius:"4px", display:"flex", flexDirection:"column", gap:"20px", padding:"24px", width:"100#", backgroundColor:"#fff", boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)"}}>
        <Typography sx={{fontSize:"18px", fontWeight:"600",textAlign:"start", color:"#2C2E3E"}}>Properties  Overview</Typography>
        <Box sx={{paddingX:"24px", width:"100%", display:"flex",justifyContent:"space-between"}}>

          <Box sx={{ display:"flex", flexDirection:"column", gap:"6px",}}>
            <Typography variant='body2' sx={{color:"#4B5563", fontSize:"16px", fontWeight:"400" }}>Total Properties</Typography>
            <Typography variant='body2' sx={{ fontSize:"36px", fontWeight:"600", textAlign:"start", color:"#1F2937" }}>{propertiesList?.length}</Typography>
          </Box>
          <Divider orientation='vertical' sx={{ height:"80px", borderWidth:"1px", backgroundColor:"#9CA3AF"}} />
           <Box sx={{ display:"flex", flexDirection:"column", gap:"6px", marginTop:"10px"}}>
            <Typography variant='body2' sx={{color:"#059669", fontSize:"16px", fontWeight:"400" }}>Occupied properties</Typography>
            <Typography variant='body2' sx={{ fontSize:"36px", fontWeight:"600", textAlign:"start", color:"#1F2937" }}>{occuppiedProperties.length}</Typography>
          </Box>
          <Divider orientation='vertical' sx={{ height:"80px", borderWidth:"1px", backgroundColor:"#9CA3AF"}} />
           <Box sx={{ display:"flex", flexDirection:"column", gap:"6px", marginTop:"10px"}}>
            <Typography variant='body2' sx={{color:"#DC2626", fontSize:"16px", fontWeight:"400" }}>Vacant properties</Typography>
            <Typography variant='body2' sx={{ fontSize:"36px", fontWeight:"600", textAlign:"start", color:"#1F2937" }}>{vaccantProperties.length}</Typography>
          </Box>
            <Divider orientation='vertical' sx={{ height:"80px", borderWidth:"1px" , backgroundColor:"#9CA3AF"}} />
           <Box sx={{ display:"flex", flexDirection:"column", gap:"6px", marginTop:"10px"}}>
            <Typography variant='body2' sx={{color:"#4B5563", fontSize:"16px", fontWeight:"400" }}>Total Units</Typography>
            <Typography variant='body2' sx={{ fontSize:"36px", fontWeight:"600", textAlign:"start", color:"#1F2937" }}>{unitsCount || 0}</Typography>
          </Box>

        </Box>

        <Divider sx={{ borderWidth:"1px", width:"100%", backgroundColor:"#DDDFE1"}}/>

        <Box sx={{ width:"100%", display:"flex", justifyContent:"space-between"}}>
          <Box sx={{height:"42px", alignItems:"center", padding:"8px", width:"100px", borderRadius:"8px", border:"1px solid #D1D5DB", display:"flex", justifyContent:"space-between"}}>
            <Typography variant='body2' sx={{ color:"#4B5563",fontSize:"14px", fontWeight:"500", textAlign:"start"}}>10</Typography>
            <img src={dropdownGreyIcon} alt="dropdownGreyIcon" />
            <Divider orientation='vertical' sx={{height:"42px", backgroundColor:"#9CA3AF",borderWidth:"1px"}}/>
            <img src={refreshIcon} alt="refreshIcon" style={{ cursor:"pointer"}} onClick={()=>{listAllProperties()}} />
          </Box>
          <Box sx={{ display:"flex", gap:"20px"}}>
            <TextField placeholder='Search by name, category, status or type' value={searchQuery} onChange={handleSearch} sx={{ width:"190px"}} InputProps={{ startAdornment:(<InputAdornment position='start'><img src={searchIcon} alt="searchIcon" style={{width:"20px", height:"20px"}} /></InputAdornment>),sx:{width:"200px", height:"42px"} }}/>
             <Box sx={{ cursor:"pointer", height:"42px", width:"100px", borderRadius:"8px",border:"1px solid #D1D5DB", display:"flex", alignItems:"center", justifyContent:"space-between",paddingX:"10px"}}>
               <Typography sx={{ color:"#4B5563", fontSize:"14px", fontWeight:"500", textAlign:"start"}}>Newest</Typography>
               <img src={filterIcon} alt="filterIcon" style={{width:"20px", height:"20px"}} />
             </Box>
             <Box sx={{ borderRadius:"8px", border:"1px solid #D1D5DB", height:"42px", width:"50px", display:"flex", alignItems:"center", justifyContent:"center"}}>
              <img src={deleteIcon} alt="deleteIcon" style={{ height:"24px", width:"24px"}} />
             </Box>
             <Box sx={{ borderRadius:"8px", border:"1px solid #D1D5DB", height:"42px", width:"50px", display:"flex", alignItems:"center", justifyContent:"center"}}>
              <img src={printerIcon} alt="printerIcon" style={{ height:"24px", width:"24px"}} />
             </Box>
          </Box>
        </Box>

        <Box sx={{width:"100%", height:"500px", marginTop:"20px"}}>
          <DataGrid  slots={{ noRowsOverlay:NoRowsOverlay}} getRowHeight={()=>100} sx={{ width:"100%" }} loading={loadingProperties} columns={propertyColumns} rows={propertyRows} pageSizeOptions={[10,20,50,100]}/>
        </Box>

      </Paper>

    </Box>
  )
}

export default Properties
